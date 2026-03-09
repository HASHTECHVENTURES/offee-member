/**
 * API and business logic services.
 * All functions accept a Supabase client (from server or browser) as first argument.
 */

export * as workspaceService from "./workspaces";
export * as okrService from "./okrs";
export * as keyResultService from "./key-results";
export * as scorecardService from "./scorecards";
export * as dailyScorecardService from "./daily-scorecards";
export * as decisionService from "./decisions";
export * as userService from "./users";
export * as aiReportService from "./ai-reports";
export * as kraService from "./kras";
export * as weeklyKRScorecardService from "./weekly-kr-scorecards";
export * as checkInService from "./kr-check-ins";
export * as commentService from "./comments";
export * as teamService from "./teams";
export * as quarterService from "./quarters";
export * as auditLogService from "./audit-logs";
export * as notificationPrefsService from "./notification-preferences";
export * as workspaceMemberService from "./workspace-members";
export * as roleService from "./roles";

// Offee Execution Model services
export * as dailyLeaderScorecardService from "./daily-leader-scorecards";
export * as leaderKPITemplateService from "./leader-kpi-templates";
export * as weeklyKRTrackingService from "./weekly-kr-tracking";
export * as performanceScoreService from "./performance-scores";
export * as rewardsPenaltiesService from "./rewards-penalties";
export * as supportRequestService from "./support-requests";
export * as productService from "./products";
