
import { t } from "elysia";

export const EncryptUrlRequestSchema = t.Object({
  url: t.String()
});

export const EncryptUrlResponseSchema = t.Object({
  encryptedUrl: t.String()
});
