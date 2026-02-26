/** Centralized API endpoints */
export const API = {
  auth: {
    me: "/auth/me",
  },
  dashboard: {
    stats: "/dashboard/stats",
    myRequests: "/dashboard/my-requests",
    muster: "/dashboard/muster",
  },
  residents: {
    list: "/residents",
  },
  visitors: {
    list: "/visitors",
    invite: "/visitors/invite",
    walkin: "/visitors/walkin",
    get: (id: string) => `/visitors/${id}`,
    approve: (id: string) => `/visitors/${id}/approve`,
    reject: (id: string) => `/visitors/${id}/reject`,
  },
  checkin: {
    otp: "/checkin/otp",
    qr: "/checkin/qr",
    checkout: "/checkin/checkout",
  },
  blacklist: {
    list: "/blacklist",
    add: "/blacklist",
    addByPhone: "/blacklist/by-phone",
    remove: (visitorId: string) => `/blacklist/${visitorId}`,
  },
  notifications: {
    list: "/notifications",
    markRead: (id: string) => `/notifications/${id}/read`,
  },
} as const;
