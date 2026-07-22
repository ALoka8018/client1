const bearerAuth = [{ bearerAuth: [] as string[] }];

const errorResponse = {
  description: "Error",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: { error: { type: "string" }, issues: { type: "array", items: {} } },
      },
    },
  },
};

function json(description: string, schema: object = {}) {
  return { description, content: { "application/json": { schema } } };
}

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Seepage Leakage All Solutions API",
    version: "1.0.0",
    description:
      "Booking, technician, and service-management API for the Seepage Leakage All Solutions plumbing platform.",
  },
  servers: [{ url: "/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "Supabase JWT" },
    },
  },
  tags: [
    { name: "Auth" },
    { name: "Services" },
    { name: "Service Areas" },
    { name: "Bookings" },
    { name: "Reviews" },
    { name: "Notifications" },
    { name: "Documents & Properties" },
    { name: "Support" },
    { name: "Attachments" },
    { name: "Technician" },
    { name: "Admin" },
    { name: "Invoices & Payments" },
  ],
  paths: {
    "/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current authenticated user",
        security: bearerAuth,
        responses: { 200: json("Current user"), 401: errorResponse },
      },
    },
    "/services": {
      get: {
        tags: ["Services"],
        summary: "List active services with review aggregates",
        responses: { 200: json("List of services") },
      },
    },
    "/service-areas/check": {
      get: {
        tags: ["Service Areas"],
        summary: "Check whether a pincode is within a served area",
        parameters: [
          { name: "pincode", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { 200: json("Coverage result"), 400: errorResponse },
      },
    },
    "/leads": {
      post: {
        tags: ["Service Areas"],
        summary: "Capture a lead for an area not yet served",
        requestBody: json("Lead payload"),
        responses: { 201: json("Created lead"), 400: errorResponse, 429: errorResponse },
      },
    },
    "/bookings": {
      post: {
        tags: ["Bookings"],
        summary: "Create a booking",
        security: bearerAuth,
        requestBody: json("Booking payload"),
        responses: { 201: json("Created booking"), 400: errorResponse, 429: errorResponse },
      },
      get: {
        tags: ["Bookings"],
        summary: "List the current user's bookings",
        security: bearerAuth,
        responses: { 200: json("List of bookings") },
      },
    },
    "/bookings/{id}": {
      patch: {
        tags: ["Bookings"],
        summary: "Reschedule or cancel a booking",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: json("Modification payload"),
        responses: { 200: json("Updated booking"), 400: errorResponse },
      },
    },
    "/bookings/{id}/attachments": {
      post: {
        tags: ["Attachments"],
        summary: "Upload a before/after photo for a booking (admin or assigned technician)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "multipart/form-data": { schema: { type: "object" } } },
        },
        responses: { 201: json("Created attachment"), 400: errorResponse, 403: errorResponse },
      },
    },
    "/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Submit a review for a completed booking",
        security: bearerAuth,
        requestBody: json("Review payload"),
        responses: { 201: json("Created review"), 400: errorResponse, 429: errorResponse },
      },
      get: {
        tags: ["Reviews"],
        summary: "List approved reviews, optionally filtered by service",
        parameters: [
          { name: "serviceId", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: { 200: json("Reviews with average/count") },
      },
    },
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List notifications for the current user",
        security: bearerAuth,
        responses: { 200: json("List of notifications") },
      },
    },
    "/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        security: bearerAuth,
        responses: { 200: json("Result") },
      },
    },
    "/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark a single notification as read",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: json("Updated notification"), 400: errorResponse },
      },
    },
    "/documents": {
      get: {
        tags: ["Documents & Properties"],
        summary: "List documents for the current user",
        security: bearerAuth,
        responses: { 200: json("List of documents") },
      },
    },
    "/properties": {
      get: {
        tags: ["Documents & Properties"],
        summary: "List properties for the current user",
        security: bearerAuth,
        responses: { 200: json("List of properties") },
      },
    },
    "/properties/{id}/health": {
      get: {
        tags: ["Documents & Properties"],
        summary: "Get health metrics for a property",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: json("Health metrics"), 404: errorResponse },
      },
    },
    "/support-tickets": {
      post: {
        tags: ["Support"],
        summary: "Create a support ticket",
        security: bearerAuth,
        requestBody: json("Support ticket payload"),
        responses: { 201: json("Created ticket"), 400: errorResponse, 429: errorResponse },
      },
      get: {
        tags: ["Support"],
        summary: "List the current user's support tickets",
        security: bearerAuth,
        responses: { 200: json("List of tickets") },
      },
    },
    "/projects/gallery": {
      get: {
        tags: ["Attachments"],
        summary: "Public before/after photo gallery (consented + featured only)",
        responses: { 200: json("Gallery items") },
      },
    },
    "/technician/jobs": {
      get: {
        tags: ["Technician"],
        summary: "List jobs assigned to the current technician",
        security: bearerAuth,
        responses: { 200: json("List of jobs") },
      },
    },
    "/technician/jobs/{id}/status": {
      patch: {
        tags: ["Technician"],
        summary: "Update job status (en route / arrived / completed), optionally with materials used",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: json("Status update payload"),
        responses: { 200: json("Updated job"), 400: errorResponse },
      },
    },
    "/technician-applications": {
      post: {
        tags: ["Technician"],
        summary: "Submit a technician job application",
        requestBody: json("Application payload"),
        responses: { 201: json("Created application"), 400: errorResponse, 429: errorResponse },
      },
    },
    "/technicians/{id}/rating": {
      get: {
        tags: ["Technician"],
        summary: "Get a technician's aggregate rating (admin only)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: json("Rating"), 404: errorResponse },
      },
    },
    "/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Dashboard stats: today's bookings, status counts, technicians, latest reviews",
        security: bearerAuth,
        responses: { 200: json("Dashboard data") },
      },
    },
    "/admin/services": {
      get: {
        tags: ["Admin"],
        summary: "List all services, including inactive",
        security: bearerAuth,
        responses: { 200: json("List of services") },
      },
      post: {
        tags: ["Admin"],
        summary: "Create a service",
        security: bearerAuth,
        requestBody: json("Service payload"),
        responses: { 201: json("Created service"), 400: errorResponse },
      },
    },
    "/admin/services/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Update a service",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: json("Partial service payload"),
        responses: { 200: json("Updated service"), 404: errorResponse },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete a service",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: json("Result"), 404: errorResponse },
      },
    },
    "/admin/reviews": {
      get: {
        tags: ["Admin"],
        summary: "List all reviews regardless of moderation status",
        security: bearerAuth,
        responses: { 200: json("List of reviews") },
      },
    },
    "/admin/reviews/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Set a review's moderation status (PENDING/APPROVED/HIDDEN)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: json("Status payload"),
        responses: { 200: json("Updated review"), 404: errorResponse },
      },
    },
    "/admin/bookings": {
      get: {
        tags: ["Admin"],
        summary: "List all bookings",
        security: bearerAuth,
        responses: { 200: json("List of bookings") },
      },
    },
    "/admin/bookings/{id}/attachments": {
      get: {
        tags: ["Admin"],
        summary: "List attachments for a booking",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: json("List of attachments") },
      },
    },
    "/admin/bookings/{id}/assign": {
      patch: {
        tags: ["Admin"],
        summary: "Assign a technician to a booking",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: json("Assignment payload"),
        responses: { 200: json("Updated booking"), 400: errorResponse },
      },
    },
    "/admin/technicians": {
      get: {
        tags: ["Admin"],
        summary: "List technician users with ratings",
        security: bearerAuth,
        responses: { 200: json("List of technicians") },
      },
    },
    "/invoices": {
      get: {
        tags: ["Invoices & Payments"],
        summary: "List invoices for the current user",
        security: bearerAuth,
        responses: { 200: json("List of invoices") },
      },
    },
    "/invoices/{number}/pdf": {
      get: {
        tags: ["Invoices & Payments"],
        summary: "Get a signed URL for an invoice PDF (paid invoices only)",
        security: bearerAuth,
        parameters: [{ name: "number", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: json("Signed URL"), 404: errorResponse },
      },
    },
    "/payments/orders": {
      post: {
        tags: ["Invoices & Payments"],
        summary: "Create a Razorpay order for an invoice",
        security: bearerAuth,
        requestBody: json("Order payload"),
        responses: { 200: json("Order"), 400: errorResponse },
      },
    },
    "/payments/verify": {
      post: {
        tags: ["Invoices & Payments"],
        summary: "Verify a Razorpay payment signature",
        security: bearerAuth,
        requestBody: json("Verification payload"),
        responses: { 200: json("Updated invoice"), 400: errorResponse },
      },
    },
    "/payments/webhook": {
      post: {
        tags: ["Invoices & Payments"],
        summary: "Razorpay webhook receiver (signature-verified)",
        responses: { 200: json("Result"), 400: errorResponse },
      },
    },
  },
};
