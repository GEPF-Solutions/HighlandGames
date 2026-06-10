using PdfSharpCore.Fonts;

namespace HighlandGames.Server.Services;

public class HighlandFontResolver : IFontResolver
{
    private readonly Dictionary<string, byte[]> _fonts = new(StringComparer.OrdinalIgnoreCase);

    public HighlandFontResolver(string assetsPath)
    {
        var assetsDir = Path.Combine(assetsPath, "Fonts");
        TryLoadAsset(assetsDir, "Cinzel-Regular");
        TryLoadAsset(assetsDir, "Cinzel-Bold");
        TryLoadAsset(assetsDir, "PlayfairDisplay-Regular");
        TryLoadAsset(assetsDir, "PlayfairDisplay-Bold");

    }

    private void TryLoadAsset(string dir, string key)
    {
        var path = Path.Combine(dir, $"{key}.ttf");
        if (File.Exists(path)) _fonts[key] = File.ReadAllBytes(path);
    }

    public FontResolverInfo ResolveTypeface(string familyName, bool isBold, bool isItalic)
    {
        if (familyName.Equals("Cinzel", StringComparison.OrdinalIgnoreCase))
        {
            var key = isBold ? "Cinzel-Bold" : "Cinzel-Regular";
            if (_fonts.ContainsKey(key)) return new FontResolverInfo(key, false, false);
            familyName = "Times New Roman";
        }
        else if (familyName.Equals("Playfair Display", StringComparison.OrdinalIgnoreCase))
        {
            var key = isBold ? "PlayfairDisplay-Bold" : "PlayfairDisplay-Regular";
            if (_fonts.ContainsKey(key)) return new FontResolverInfo(key, false, false);
            familyName = "Times New Roman";
        }

        return PlatformFontResolver.ResolveTypeface(familyName, isBold, isItalic);
    }

    public byte[] GetFont(string faceName)
    {
        _fonts.TryGetValue(faceName, out var data);
        return data!;
    }

    public string DefaultFontName => "Times New Roman";
}
