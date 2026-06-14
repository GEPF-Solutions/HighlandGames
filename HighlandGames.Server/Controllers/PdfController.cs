using HighlandGames.Server.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HighlandGames.Server.Controllers;

[ApiController]
[Route("api/pdf")]
[Authorize]
public class PdfController : ControllerBase
{
    private readonly IPdfService _pdfService;

    public PdfController(IPdfService pdfService) => _pdfService = pdfService;

    [HttpGet("matches/{disciplineId}")]
    public async Task<IActionResult> GetMatchList(string disciplineId)
    {
        var pdf = await _pdfService.GenerateMatchListAsync(disciplineId);
        return File(pdf, "application/pdf", $"{disciplineId}.pdf");
    }

    [HttpGet("results")]
    [AllowAnonymous]
    public async Task<IActionResult> GetResults([FromQuery] bool printMode = false)
    {
        var pdf = await _pdfService.GenerateCombinedResultsAsync(printMode);
        return File(pdf, "application/pdf", "Ergebnisse.pdf");
    }

    [HttpGet("certificates")]
    public async Task<IActionResult> GetCertificates([FromQuery] bool printMode = false)
    {
        var pdf = await _pdfService.GenerateCertificatesAsync(printMode);
        return File(pdf, "application/pdf", "Urkunden.pdf");
    }
}
