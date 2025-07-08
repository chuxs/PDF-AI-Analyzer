const inputElement = document.getElementById("file_inputID");
inputElement.addEventListener("change", handleFiles, false);

function handleFiles() {
    const fileList = this.files[0]; /* now you can work with the file list */
    console.log(fileList.name);

    pdfName = document.getElementById("pdf-name");
    pdfName.innerText = fileList.name;
  
    const actualPdfFIle = URL.createObjectURL(fileList);
    pdfDisplay = document.getElementById("image-content-id");
    pdfDisplay.src = actualPdfFIle;

}