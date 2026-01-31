
// Declare Bun global
declare const Bun: any;

const UPLOAD_DIR = "public/uploads";

// Ensure upload dir exists
await Bun.write(`${UPLOAD_DIR}/.keep`, "");

export const saveFile = async (file: File): Promise<string> => {
  const name = `${Date.now()}-${file.name}`;
  await Bun.write(`${UPLOAD_DIR}/${name}`, file);
  return `/public/uploads/${name}`;
};
