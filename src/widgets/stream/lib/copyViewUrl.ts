export const copyViewerUrl = (viewerUrl: string) => {
    if (viewerUrl) {
      navigator.clipboard.writeText(viewerUrl);
      alert("Ссылка скопирована!");
    }
  };