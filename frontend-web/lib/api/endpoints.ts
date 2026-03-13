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
    byVisit: "/checkin/by-visit",
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
    createSocietyNotice: "/notifications/society",
  },
  societyComplaints: {
    list: "/society/complaints",
    stats: "/society/complaints/stats",
    create: "/society/complaints",
    get: (id: string) => `/society/complaints/${id}`,
    update: (id: string) => `/society/complaints/${id}`,
    comments: (id: string) => `/society/complaints/${id}/comments`,
  },
  societyAmenities: {
    list: "/society/amenities",
    create: "/society/amenities",
    get: (id: string) => `/society/amenities/${id}`,
    update: (id: string) => `/society/amenities/${id}`,
    delete: (id: string) => `/society/amenities/${id}`,
  },
  societyStaff: {
    list: "/society/staff",
    create: "/society/staff",
    get: (id: string) => `/society/staff/${id}`,
    update: (id: string) => `/society/staff/${id}`,
    delete: (id: string) => `/society/staff/${id}`,
  },
} as const;
