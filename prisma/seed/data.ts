import type { PostStatus } from "@prisma/client";

// Sample workspace: the feedback board of Planhive, a fictional task and project
// planning app for teams.

export const SAMPLE_OWNER_NAME = "Planhive Team";

export const SAMPLE_BOARD = {
  slug: "planhive",
  name: "Planhive Feedback",
  description:
    "Help us shape Planhive. Suggest features, upvote what your team needs and follow what we're building.",
  isPublic: true,
};

export const SAMPLE_CATEGORIES = [
  { name: "Feature", color: "#6366f1" },
  { name: "Bug", color: "#ef4444" },
  { name: "Improvement", color: "#10b981" },
  { name: "Integration", color: "#f59e0b" },
] as const;

export type SampleCategory = (typeof SAMPLE_CATEGORIES)[number]["name"];

export const SAMPLE_VOTERS = [
  "Maya Chen", "Liam O'Connor", "Priya Raman", "Jonas Weber", "Sofia Alvarez",
  "Daniel Kim", "Amara Okafor", "Lucas Martin", "Hannah Schmidt", "Ethan Brooks",
  "Yuki Tanaka", "Olivia Rossi", "Noah Johnson", "Fatima Zahra", "Mateo Silva",
  "Chloe Dubois", "Arjun Mehta", "Grace Lee", "Samuel Adeyemi", "Emma Nilsson",
  "Ravi Patel", "Isabella Costa", "Tom Fischer", "Leila Haddad",
];

export type SamplePost = {
  title: string;
  content: string;
  status: PostStatus;
  cat: SampleCategory;
  daysAgo: number;
  votes: number;
  // Comments starting with "team:" are posted by the Planhive team (the board owner)
  comments: string[];
  ownerVoted?: boolean;
};

export const SAMPLE_POSTS: SamplePost[] = [
  {
    title: "Google Calendar sync for due dates",
    content:
      "Show task due dates in Google Calendar and keep them in sync when a date changes in Planhive. Our team plans the week from the calendar, not the task list.",
    status: "IN_PROGRESS", cat: "Integration", daysAgo: 54, votes: 22,
    comments: [
      "Two-way sync would be ideal, but even read-only would help a lot.",
      "team:We're building this now. Read-only sync ships first, two-way after.",
      "Please support Outlook too when you get to it.",
    ],
  },
  {
    title: "Recurring tasks",
    content:
      "Let us set a task to repeat daily, weekly or monthly. Right now we recreate our weekly report and sprint planning tasks by hand.",
    status: "PLANNED", cat: "Feature", daysAgo: 49, votes: 20,
    comments: ["Custom schedules like 'every second Tuesday' would be perfect.", "team:Planned for next quarter."],
  },
  {
    title: "Dark mode",
    content:
      "A dark theme for the web app, ideally following the system setting. Long planning sessions in the evening are hard on the eyes.",
    status: "DONE", cat: "Improvement", daysAgo: 60, votes: 24,
    comments: [
      "team:Shipped! Switch it on under Settings → Appearance, or let it follow your system.",
      "Looks great, thank you!",
    ],
  },
  {
    title: "Task dependencies",
    content:
      "Mark a task as blocked by another one, and warn me when I move a task's date before the task it depends on.",
    status: "PLANNED", cat: "Feature", daysAgo: 41, votes: 18,
    comments: ["A simple timeline view showing the chain would make this even better."],
    ownerVoted: true,
  },
  {
    title: "Slack notifications for assigned tasks",
    content:
      "Send a Slack DM when someone assigns me a task or mentions me in a comment. Email notifications get lost.",
    status: "IN_PROGRESS", cat: "Integration", daysAgo: 35, votes: 16,
    comments: ["Channel notifications per project would be useful too.", "team:Beta starts next week for teams that opt in."],
  },
  {
    title: "Offline mode in the mobile app",
    content:
      "I often check tasks on the train with no signal. Let me view and tick off tasks offline and sync when I'm back online.",
    status: "OPEN", cat: "Feature", daysAgo: 22, votes: 15,
    comments: ["Same for flights. Even read-only offline access would help."],
    ownerVoted: true,
  },
  {
    title: "Time tracking on tasks",
    content:
      "A start/stop timer on each task and a weekly summary per project, so we can bill clients without a separate tool.",
    status: "OPEN", cat: "Feature", daysAgo: 28, votes: 13,
    comments: ["Export to CSV for invoicing please."],
  },
  {
    title: "Drag and drop not working in Safari",
    content:
      "On Safari 17 I can't drag cards between columns on the board view. It works fine in Chrome.",
    status: "IN_PROGRESS", cat: "Bug", daysAgo: 8, votes: 9,
    comments: ["Also broken on iPad Safari.", "team:Thanks, reproduced. A fix is in review."],
  },
  {
    title: "Faster loading for large projects",
    content:
      "Projects with 1,000+ tasks take several seconds to open and scrolling the list stutters.",
    status: "DONE", cat: "Improvement", daysAgo: 58, votes: 12,
    comments: ["team:Shipped a new list renderer. Big projects now open in under a second.", "Night and day difference, thanks!"],
  },
  {
    title: "Subtasks with their own assignees",
    content:
      "Break a task into smaller steps and assign each step to a different person, with progress shown on the parent task.",
    status: "DONE", cat: "Feature", daysAgo: 57, votes: 21,
    comments: ["team:Live for everyone now. Add subtasks from the task panel."],
  },
  {
    title: "Import projects from Trello and Asana",
    content:
      "We want to move over but have years of boards in Trello. An importer that keeps lists, labels and comments would make switching easy.",
    status: "PLANNED", cat: "Integration", daysAgo: 31, votes: 14,
    comments: ["Jira import would be great as well."],
  },
  {
    title: "Due dates show the wrong day across time zones",
    content:
      "A teammate in New York set a task due Friday, but for me in Berlin it shows Saturday. Looks like dates are converted to my time zone.",
    status: "OPEN", cat: "Bug", daysAgo: 6, votes: 6,
    comments: ["Seeing the same between London and Singapore."],
  },
  {
    title: "Keyboard shortcuts",
    content:
      "Shortcuts to create a task, assign it and change its status without touching the mouse. Like Linear's command menu.",
    status: "OPEN", cat: "Improvement", daysAgo: 18, votes: 10,
    comments: [],
    ownerVoted: true,
  },
  {
    title: "Project templates",
    content:
      "Save a project as a template so every new client onboarding starts with the same tasks and sections.",
    status: "OPEN", cat: "Feature", daysAgo: 15, votes: 11,
    comments: ["Sharing templates across workspaces would be a bonus."],
  },
  {
    title: "Share a read-only project link with clients",
    content:
      "Give clients a link to see progress on their project without inviting them as members.",
    status: "OPEN", cat: "Feature", daysAgo: 12, votes: 8,
    comments: [],
    ownerVoted: true,
  },
  {
    title: "Built-in team chat",
    content: "A chat panel inside Planhive so we don't need Slack for project conversations.",
    status: "REJECTED", cat: "Feature", daysAgo: 39, votes: 5,
    comments: [
      "team:We'd rather do one thing well. Task comments plus our Slack integration cover this without adding another chat tool.",
    ],
  },
  {
    title: "Notifications arrive twice",
    content: "Since last week every assignment email arrives twice.",
    status: "DONE", cat: "Bug", daysAgo: 26, votes: 4,
    comments: ["team:Fixed. A retry job was sending duplicates. Sorry about the noise!"],
  },
  {
    title: "Workload view per teammate",
    content:
      "See how many tasks each person has due this week so we can rebalance before someone gets overloaded.",
    status: "OPEN", cat: "Feature", daysAgo: 4, votes: 7,
    comments: [],
    ownerVoted: true,
  },
  {
    title: "Bulk edit tasks",
    content: "Select several tasks and change the assignee, due date or status in one go.",
    status: "OPEN", cat: "Improvement", daysAgo: 2, votes: 3,
    comments: [],
  },
  {
    title: "Zapier integration",
    content: "Triggers for new and completed tasks so we can connect Planhive to our CRM.",
    status: "OPEN", cat: "Integration", daysAgo: 1, votes: 2,
    comments: [],
  },
];
