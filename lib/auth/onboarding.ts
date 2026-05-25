// Single source of truth for "given this user_status, which screen should the
// user be on?". Used by login/verify-email routing and by requireVerified() so
// a half-onboarded user is sent to their *actual* next step instead of being
// dumped on the "Awaiting review" screen prematurely.
//
// Onboarding order: Personal -> Two-factor -> Identity -> Assessment -> Complete.
// `pending_address_proof` is repurposed to mean "identity submitted, assessment
// still pending" (it is otherwise unused in the flow), which avoids a DB enum
// migration on the live demo database.
export function nextStepForStatus(status: string | null | undefined): string {
  switch (status) {
    case "verified":
      return "/dashboard";
    case "pending_admin_approval":
      return "/onboarding/complete";
    case "pending_address_proof":
      return "/onboarding/assessment";
    case "pending_identity":
      return "/onboarding/identity";
    case "pending_2fa":
      return "/onboarding/two-factor";
    case "pending_email_verification":
    case "pending_personal_details":
    default:
      return "/onboarding/personal-details";
  }
}
