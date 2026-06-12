using HighlandGames.Server.DTOs;
using HighlandGames.Server.Services.Abstractions;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HighlandGames.Server.Services;

public class PdfService : IPdfService
{
    private readonly IMatchService _matchService;
    private readonly IResultService _resultService;
    private readonly IDisciplineService _disciplineService;
    private readonly string _assetsPath;

    // Both modes are A4 (595.32 × 841.92 pt) with identical content positions.
    // Positions derived from template PDF image transform matrices.
    private const double PageWidth     = 595.32;
    private const double PageHeight    = 841.92;
    private const double ContentLeft   = 79.56;   // left edge of left logo
    private const double ContentWidth  = 481.08;  // right edge of right logo (560.64) - ContentLeft
    private const double TitleContentY = 207;     // just below header graphic (bottom at 203.58 pt)
    private const double CertContentY  = 207;

    public PdfService(
        IMatchService matchService,
        IResultService resultService,
        IDisciplineService disciplineService,
        IWebHostEnvironment env)
    {
        _matchService = matchService;
        _resultService = resultService;
        _disciplineService = disciplineService;
        _assetsPath = Path.Combine(env.ContentRootPath, "Assets");
    }

    // ── Match list (QuestPDF, no template, both genders) ────────────────────

    public async Task<byte[]> GenerateMatchListAsync(string disciplineId)
    {
        var discipline = await _disciplineService.GetByIdAsync(disciplineId);
        var matchesM = (await _matchService.GetAllAsync(disciplineId, "m")).OrderBy(m => m.Order).ToList();
        var matchesF = (await _matchService.GetAllAsync(disciplineId, "f")).OrderBy(m => m.Order).ToList();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginTop(1.5f, Unit.Centimetre);
                page.MarginBottom(1.2f, Unit.Centimetre);
                page.MarginHorizontal(1.5f, Unit.Centimetre);

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text(discipline?.Name ?? disciplineId).FontSize(22).Bold();
                            c.Item().Text("Highland-Games 2026").FontSize(12).FontColor(Colors.Grey.Darken1);
                        });
                        row.ConstantItem(72).AlignRight().AlignMiddle()
                            .Text("13.6.2026").FontSize(11).FontColor(Colors.Grey.Darken1);
                    });
                    col.Item().PaddingTop(8).LineHorizontal(1.5f).LineColor(Colors.Black);
                });

                page.Content().PaddingTop(10).Column(mainCol =>
                {
                    RenderGenderSection(mainCol, "Gentlemen", matchesM);
                    mainCol.Item().Height(14);
                    RenderGenderSection(mainCol, "Ladies", matchesF);
                });

                page.Footer().AlignCenter()
                    .Text($"Highland-Games Höchst  ·  {discipline?.Name}  ·  13.6.2026")
                    .FontSize(8).FontColor(Colors.Grey.Darken1);
            });
        });

        return document.GeneratePdf();
    }

    private static void RenderGenderSection(ColumnDescriptor col, string label, List<MatchDto> matches)
    {
        col.Item().PaddingBottom(6).Text(label).FontSize(13).Bold();

        if (matches.Count == 0)
        {
            col.Item().Text("Keine Begegnungen").FontSize(11).Italic().FontColor(Colors.Grey.Medium);
            return;
        }

        for (int i = 0; i < matches.Count; i++)
        {
            RenderMatchRow(col.Item(), matches[i], i + 1);
            if (i < matches.Count - 1)
                col.Item().PaddingVertical(1).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
        }
    }

    // Layout: [22 #] [160 TeamA] [72 Box] [22 vs] [160 TeamB] [72 Box] = 508pt total
    private static void RenderMatchRow(IContainer container, MatchDto match, int number)
    {
        container.PaddingVertical(3).Row(r =>
        {
            r.ConstantItem(22).AlignMiddle()
                .Text($"{number}.").FontSize(13).Bold();

            r.ConstantItem(160).AlignMiddle()
                .Text(match.TeamAName).FontSize(12).Bold();

            r.ConstantItem(72)
                .Border(1).BorderColor(Colors.Grey.Medium)
                .Height(22).Text("");

            if (match.TeamBId != null)
            {
                r.ConstantItem(22).AlignMiddle().AlignCenter()
                    .Text("vs").FontSize(10).FontColor(Colors.Grey.Darken1);

                r.ConstantItem(160).AlignMiddle()
                    .Text(match.TeamBName ?? "—").FontSize(12).Bold();

                r.ConstantItem(72)
                    .Border(1).BorderColor(Colors.Grey.Medium)
                    .Height(22).Text("");
            }
        });
    }

    // ── Combined results (both genders) ──────────────────────────────────────

    public async Task<byte[]> GenerateCombinedResultsAsync(bool printMode)
    {
        var ladies = (await _resultService.GetLeaderboardAsync("f")).ToList();
        var gents  = (await _resultService.GetLeaderboardAsync("m")).ToList();

        using var outputDoc = new PdfDocument();
        PdfDocument? template = null;
        PdfPage page;

        if (!printMode)
        {
            var templatePath = Path.Combine(_assetsPath, "Ranking-Template.pdf");
            template = PdfReader.Open(templatePath, PdfDocumentOpenMode.Import);
            page = outputDoc.AddPage(template.Pages[0]);
        }
        else
        {
            page = outputDoc.AddPage();
            page.Width  = XUnit.FromPoint(PageWidth);
            page.Height = XUnit.FromPoint(PageHeight);
        }

        try
        {
            using var gfx = XGraphics.FromPdfPage(page);
            DrawCombinedResults(gfx, ladies, gents);
        }
        finally { template?.Dispose(); }

        using var stream = new MemoryStream();
        outputDoc.Save(stream);
        return stream.ToArray();
    }

    private void DrawCombinedResults(XGraphics gfx,
        List<LeaderboardEntryDto> ladies, List<LeaderboardEntryDto> gents)
    {
        var uo = new XPdfFontOptions(PdfFontEncoding.Unicode);
        var sectionFont = new XFont("Playfair Display", 23, XFontStyle.Bold,    uo);
        var colFont     = new XFont("Playfair Display", 14, XFontStyle.Bold,    uo);
        var rowFont     = new XFont("Playfair Display", 15, XFontStyle.Regular, uo);
        var numFont     = new XFont("Playfair Display", 15, XFontStyle.Bold,    uo);

        double y = TitleContentY + 30;
        DrawResultsSection(gfx, "Ladies",    ladies, ref y, sectionFont, colFont, rowFont, numFont);
        y += 18;
        DrawResultsSection(gfx, "Gentlemen", gents,  ref y, sectionFont, colFont, rowFont, numFont);
    }

    private void DrawResultsSection(XGraphics gfx, string title,
        List<LeaderboardEntryDto> entries, ref double y,
        XFont sectionFont, XFont colFont, XFont rowFont, XFont numFont)
    {
        double left  = ContentLeft;
        double width = ContentWidth;

        gfx.DrawString(title, sectionFont, XBrushes.Black,
            new XRect(left, y, width, 28), XStringFormats.TopLeft);
        y += 32;

        gfx.DrawString("#",      colFont, XBrushes.Black,
            new XRect(left,      y, 24,              16), XStringFormats.TopLeft);
        gfx.DrawString("Clan",   colFont, XBrushes.Black,
            new XRect(left + 28, y, width - 28 - 60, 16), XStringFormats.TopLeft);
        gfx.DrawString("Points", colFont, XBrushes.Black,
            new XRect(left,      y, width,            16), XStringFormats.TopRight);
        y += 20;

        gfx.DrawLine(new XPen(XColor.FromArgb(180, 180, 180), 0.5), left, y, left + width, y);
        y += 6;

        const double rowH = 22;
        for (int i = 0; i < entries.Count; i++)
        {
            var e = entries[i];
            gfx.DrawString($"{i + 1}", numFont, XBrushes.Black,
                new XRect(left,      y, 24,              rowH), XStringFormats.TopLeft);
            gfx.DrawString(e.TeamName, rowFont, XBrushes.Black,
                new XRect(left + 28, y, width - 28 - 60, rowH), XStringFormats.TopLeft);
            gfx.DrawString(e.TotalPoints.ToString(), rowFont, XBrushes.Black,
                new XRect(left,      y, width,            rowH), XStringFormats.TopRight);
            y += rowH;
        }
    }

    // ── Certificates ─────────────────────────────────────────────────────────

    public async Task<byte[]> GenerateCertificatesAsync(bool printMode)
    {
        var ladies = (await _resultService.GetLeaderboardAsync("f")).ToList();
        var gents  = (await _resultService.GetLeaderboardAsync("m")).ToList();

        using var outputDoc = new PdfDocument();
        PdfDocument? template = null;

        if (!printMode)
        {
            var templatePath = Path.Combine(_assetsPath, "Certificate-Template.pdf");
            template = PdfReader.Open(templatePath, PdfDocumentOpenMode.Import);
        }

        try
        {
            void AddPages(List<LeaderboardEntryDto> entries, string genderLabel)
            {
                for (int i = 0; i < entries.Count; i++)
                {
                    PdfPage page;
                    if (!printMode)
                        page = outputDoc.AddPage(template!.Pages[0]);
                    else
                    {
                        page = outputDoc.AddPage();
                        page.Width  = XUnit.FromPoint(PageWidth);
                        page.Height = XUnit.FromPoint(PageHeight);
                    }
                    using var gfx = XGraphics.FromPdfPage(page);
                    DrawCertificate(gfx, entries[i].TeamName, i + 1,
                        genderLabel, entries[i].TotalPoints);
                }
            }

            AddPages(ladies, "Ladies");
            AddPages(gents,  "Gentlemen");
        }
        finally { template?.Dispose(); }

        using var stream = new MemoryStream();
        outputDoc.Save(stream);
        return stream.ToArray();
    }

    private void DrawCertificate(XGraphics gfx, string teamName, int place,
        string genderLabel, int totalPoints)
    {
        var uo = new XPdfFontOptions(PdfFontEncoding.Unicode);
        var placeFont  = new XFont("Playfair Display", 42, XFontStyle.Bold,    uo);
        var genderFont = new XFont("Playfair Display", 19, XFontStyle.Regular, uo);
        var labelFont  = new XFont("Playfair Display", 19, XFontStyle.Regular, uo);
        var nameFont   = new XFont("Playfair Display", 42, XFontStyle.Bold,    uo);
        var pointsFont = new XFont("Playfair Display", 19, XFontStyle.Regular, uo);

        var row = (double y, double h) => new XRect(ContentLeft, y, ContentWidth, h);
        double cx = ContentLeft + ContentWidth / 2.0;

        var nameLines = WrapText(gfx, teamName, nameFont, ContentWidth);

        const double nameLineH = 62;
        double blockH = 44
                      + 14 + 32
                      + 32
                      + 18 + 8
                      + nameLines.Count * nameLineH
                      + 24 + 30;
        double availH = PageHeight - CertContentY - 60;
        double y = CertContentY + Math.Max(28, (availH - blockH) / 2.0);

        gfx.DrawString($"{place}. Place", placeFont, XBrushes.Black,
            row(y, 44), XStringFormats.Center);
        y += 44 + 14;

        gfx.DrawString(genderLabel, genderFont, XBrushes.Black,
            row(y, 32), XStringFormats.Center);
        y += 32 + 16;

        gfx.DrawLine(new XPen(XColor.FromArgb(150, 150, 150), 0.7), cx - 60, y, cx + 60, y);
        y += 16;

        gfx.DrawString("Clan", labelFont, new XSolidBrush(XColor.FromArgb(120, 120, 120)),
            row(y, 18), XStringFormats.Center);
        y += 18 + 8;

        foreach (var line in nameLines)
        {
            gfx.DrawString(line, nameFont, XBrushes.Black, row(y, nameLineH), XStringFormats.Center);
            y += nameLineH;
        }
        y += 24;

        gfx.DrawString($"{totalPoints} Points", pointsFont, XBrushes.Black,
            row(y, 30), XStringFormats.Center);
    }

    private static List<string> WrapText(XGraphics gfx, string text, XFont font, double maxWidth)
    {
        var lines = new List<string>();
        var current = new System.Text.StringBuilder();

        foreach (var word in text.Split(' '))
        {
            var candidate = current.Length == 0 ? word : current + " " + word;
            if (gfx.MeasureString(candidate, font).Width <= maxWidth)
            {
                if (current.Length > 0) current.Append(' ');
                current.Append(word);
            }
            else
            {
                if (current.Length > 0) lines.Add(current.ToString());
                current.Clear().Append(word);
            }
        }
        if (current.Length > 0) lines.Add(current.ToString());
        return lines;
    }
}
