
import { t } from "elysia";

export const FollowStatusResponse = t.Object({
    isFollowing: t.Boolean()
});

export const FollowBodySchema = t.Object({
    targetId: t.String()
});

export const UnfollowQuerySchema = t.Object({
    targetId: t.String()
});

export const CheckFollowQuerySchema = t.Object({
    targetId: t.String()
});
