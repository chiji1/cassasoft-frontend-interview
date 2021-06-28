export const convertFilesToBase64Strings = async (event: Event): Promise<string[]> => {
    const base64Strings: string[] = [];
    const files: any = (event.target as HTMLInputElement).files;
    for (const file of files) {
      const filePath: string = await new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve((fileReader.result as string));
        fileReader.readAsDataURL(file);
      });
      base64Strings.push(filePath);
    }
    return base64Strings;
};