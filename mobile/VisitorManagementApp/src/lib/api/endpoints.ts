/**
 * Path fragments (joined with `API_BASE_URL`).
 * `apiClient` runs `normalizeApiPath` so single-segment collection URLs get a trailing slash
 * when FastAPI expects it (avoids 307 redirects that drop `Authorization`).
 */
export const API = {
  auth: { me: '/auth/me' },
  dashboard: {
    stats: '/dashboard/stats',
    myRequests: '/dashboard/my-requests',
    muster: '/dashboard/muster',
  },
  residents: { list: '/residents' },
  visitors: {
    list: '/visitors',
    invite: '/visitors/invite',
    walkin: '/visitors/walkin',
    get: (id: string) => `/visitors/${id}`,
    approve: (id: string) => `/visitors/${id}/approve`,
    reject: (id: string) => `/visitors/${id}/reject`,
  },
  checkin: {
    otp: '/checkin/otp',
    qr: '/checkin/qr',
    checkout: '/checkin/checkout',
  },
  blacklist: {
    list: '/blacklist',
    add: '/blacklist',
    addByPhone: '/blacklist/by-phone',
    remove: (visitorId: string) => `/blacklist/${visitorId}`,
  },
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    generateNoticeMessage: '/notifications/society/generate-message',
    createSocietyNotice: '/notifications/society',
  },
  nearbyPlaces: {
    list: '/nearby-places',
    categories: '/nearby-places/categories',
  },
  platform: {
    dashboard: '/admin/dashboard',
    societies: '/admin/societies',
    society: (id: string) => `/admin/societies/${id}`,
    auditLogs: '/admin/audit-logs',
  },
  meetings: {
    list: '/meetings',
    create: '/meetings',
    query: '/meetings/query',
    get: (id: string) => `/meetings/${id}`,
    summarize: (id: string) => `/meetings/${id}/summarize`,
  },
  societyStaff: {
    list: '/society/staff',
    create: '/society/staff',
  },
  societyAmenities: {
    list: '/society/amenities',
    create: '/society/amenities',
  },
  societyComplaints: {
    list: '/society/complaints',
    stats: '/society/complaints/stats',
    update: (id: string) => `/society/complaints/${id}`,
  },
  residentComplaints: {
    my: '/complaints/my',
    create: '/complaints',
  },
  maintenance: {
    myBills: '/maintenance/my-bills',
    mySummary: '/maintenance/my-summary',
  },
  flats: {
    list: '/flats',
  },
  public: {
    visitPass: (visitId: string) => `/public/pass/${visitId}`,
  },
} as const;
