export function createAndDownloadFile(fileName: string, fileContent: string) {
  // Generate file from json
  const blob = new Blob([fileContent], {
    type: "application/json",
  });

  // Create download link and download file
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName.toLowerCase().replace(/ /g, "-")}.json`;
  a.click();
  a.remove();
}
