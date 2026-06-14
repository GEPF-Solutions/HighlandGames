export const downloadPdf = async (path: string, filename: string): Promise<void> => {
    const token = localStorage.getItem('hg_token');
    const response = await fetch(`/api${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};
