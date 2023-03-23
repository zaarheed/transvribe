import { SESSION_KEY } from "@/constants/config";
import { isBefore } from "date-fns";

export default function hasValidProSession(type = "playlist") {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || null);

    if (!session) return false;

    const { expiresAt } = session;

    const isExpired = isBefore(new Date(), new Date(expiresAt));

    if (isExpired) return false;

    return true;
}