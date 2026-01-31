
import { t } from "elysia";

export const ToggleLikeResponse = t.Object({
    status: t.Union([t.Literal('liked'), t.Literal('unliked')])
});
