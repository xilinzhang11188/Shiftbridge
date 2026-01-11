# PRODUCT REQUIREMENTS DOCUMENT - ShiftBridge

## EXECUTIVE SUMMARY

**Product Name:** ShiftBridge

**Product Vision:** ShiftBridge is a comprehensive healthcare staffing and scheduling platform designed for multi-state operations. It connects healthcare facilities (clients) with licensed healthcare workers across multiple states, automating shift matching based on distance, licensing, and service capabilities. The platform streamlines the entire workflow from shift creation to worker assignment, with intelligent eligibility matching and real-time notifications.

**Core Purpose:** Eliminates the complexity of managing healthcare staffing across multiple states, facilities, and service types by providing automated worker-shift matching, real-time notifications, and comprehensive shift management for all stakeholders.

**Target Users:** Healthcare facility administrators, healthcare workers (Medical Providers, Nurses, Medical Assistants), and staffing agency administrators managing multi-state operations.

**Key MVP Features:**
- Multi-Role User Management (Client, Worker, Admin)
- Intelligent Shift Matching (distance + license + service)
- Real-Time Notification System
- Multi-State Licensing Support
- Shift Claiming and Assignment Workflow
- Multi-Site Client Management

**Platform:** Web application (responsive, accessible via browser on desktop, tablet, and mobile devices)

**Complexity Assessment:** High
- State Management: Complex multi-role workflows with real-time notifications
- External Integrations: Distance calculation API (Google Maps/similar)
- Business Logic: Complex - eligibility matching, notification routing, multi-state licensing validation

**MVP Success Criteria:**
- Users can register and manage profiles for all three roles
- System automatically identifies eligible workers based on distance, license, and service
- Workers can claim shifts and admins can assign from claimants
- Real-time notifications for all shift lifecycle events
- Multi-state and multi-site support fully functional

---

## 1. USERS & PERSONAS

**Primary Persona - Admin:**
- **Name:** Sarah the Staffing Coordinator
- **Context:** Manages healthcare staffing for multiple facilities across 3 states. Needs to quickly match qualified workers to urgent shift requests while ensuring all licensing and distance requirements are met.
- **Goals:** Efficiently create and assign shifts; see all eligible workers instantly; manage cancellations smoothly; maintain compliance with state licensing requirements.
- **Pain Points:** Manual worker matching is time-consuming; hard to track who's licensed where; distance calculations done manually; missed notifications lead to unfilled shifts.

**Secondary Persona - Worker:**
- **Name:** Marcus the Traveling Nurse
- **Context:** Licensed RN in 3 states, willing to travel up to 50 miles for shifts. Wants to maximize income by claiming shifts that match his schedule and location.
- **Goals:** See all available shifts in his area; quickly claim shifts before others; know immediately when assigned; manage his schedule efficiently.
- **Pain Points:** Misses shift opportunities due to slow notifications; wastes time on shifts outside his license states; unclear about eligibility before claiming.

**Tertiary Persona - Client:**
- **Name:** Dr. Jennifer the Clinic Manager
- **Context:** Manages 3 clinic locations across 2 states. Needs reliable staffing for various services (medical provider coverage, nursing support, medical assistant help).
- **Goals:** Request shifts easily for any location; see confirmed workers quickly; manage multiple contact persons; cancel when needed without hassle.
- **Pain Points:** Unclear shift status; can't track which location needs coverage; multiple contact persons not organized; cancellation process unclear.

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Core MVP Features (Priority 0)

**FR-001: Multi-Role User Registration & Authentication**
- **Description:** Users register and authenticate as Client, Worker, or Admin with role-specific profile fields
- **Entity Type:** System/Configuration
- **Operations:** Register (role-specific), Login, Logout, View profile, Edit profile, Password reset
- **Key Rules:** 
  - Client: company name, address, contact person (name, email, phone), requested services (multi-select)
  - Worker: name, address, phone, email, license type (Medical Provider/Nurse/Medical Assistant), licensed states (multi-select), services offered (multi-select)
  - Admin: name, address, email, phone
  - Email must be unique across all roles
- **Acceptance:** Users can register with role-specific fields, login securely, and access role-appropriate dashboards

**FR-002: Client Multi-Site Management**
- **Description:** Clients can manage multiple sites with different addresses, services, and contact persons
- **Entity Type:** User-Generated Content
- **Operations:** Create site, View sites, Edit site, Delete site, Add contact person, Manage services per site
- **Key Rules:** 
  - Each site has unique address
  - Multiple contact persons per site (name, email, phone)
  - Different services can be requested per site
  - Site address used for distance calculations
- **Acceptance:** Clients can create and manage multiple sites with independent contact persons and service selections

**FR-003: Shift Creation & Management**
- **Description:** Clients request shifts and Admins create/manage shifts with 24-hour scheduling support
- **Entity Type:** User-Generated Content
- **Operations:** Create shift, View shifts, Edit shift, Cancel shift, Assign worker, Confirm shift
- **Key Rules:**
  - Shift includes: client site, service type(s), day, start time, end time, repeatable pattern (optional)
  - Can be created by Client (request) or Admin (direct creation)
  - Client requests require Admin confirmation
  - Admin can assign specific worker or mark "to be determined"
  - Multiple services can be included in one shift
- **Acceptance:** Shifts can be created with full scheduling details, assigned to workers, and managed through their lifecycle

**FR-004: Intelligent Worker Eligibility Matching**
- **Description:** System automatically identifies eligible workers for shifts based on distance, licensing, and service capabilities
- **Entity Type:** System Data
- **Operations:** Calculate eligibility, View eligible workers, Filter by criteria
- **Key Rules:**
  - **Distance Check:** Worker address to shift site address ≤ 50 miles (driving distance)
  - **Service Check:** Shift service(s) must match worker's offered services
  - **License Check:** Shift site state must match worker's licensed states
  - All three criteria must be met for eligibility
  - Eligibility calculated in real-time when shift created/updated
- **Acceptance:** System correctly identifies only workers meeting all three eligibility criteria for each shift

**FR-005: Shift Claiming & Assignment Workflow**
- **Description:** Eligible workers can claim shifts, admins assign from claimants, with notification at each step
- **Entity Type:** User-Generated Content + System Data
- **Operations:** Claim shift (worker), View claimants (admin), Assign worker (admin), Confirm assignment (worker)
- **Key Rules:**
  - Only eligible workers see shift opportunities
  - Multiple workers can claim same shift
  - Admin sees all claimants and selects one
  - Unselected claimants notified "assigned to others"
  - Workers attempting to claim already-assigned shift see "already assigned" message
  - Assigned worker must confirm to finalize
- **Acceptance:** Workers can claim shifts, admins can assign from claimants, and all parties receive appropriate notifications

**FR-006: Real-Time Notification System**
- **Description:** In-app notifications for all shift lifecycle events with "new" badges
- **Entity Type:** System Data
- **Operations:** Send notification, View notifications, Mark as read, Auto-clear after 3 days
- **Key Rules:**
  - Notifications sent for: shift requests, confirmations, assignments, cancellations, claims
  - "New" badge appears on relevant items
  - Badge clears when user clicks item OR after 3 days
  - Notifications visible in user's dashboard
  - Role-specific notification routing
- **Acceptance:** All users receive timely notifications for relevant events with proper badge management

**FR-007: Shift Cancellation Workflow**
- **Description:** Clients or Admins can cancel shifts with confirmation and notification flow
- **Entity Type:** User-Generated Content
- **Operations:** Initiate cancellation, Confirm cancellation, Notify affected parties, Remove from dashboards
- **Key Rules:**
  - Client cancellation requires Admin confirmation
  - Admin cancellation requires Client confirmation
  - Assigned workers automatically notified
  - Shift removed from all dashboards after confirmation
  - Cancellation history maintained for audit
- **Acceptance:** Cancellations flow through proper confirmation process and all affected parties are notified

**FR-008: Admin Service Management**
- **Description:** Admins create and manage service types with client assignment options
- **Entity Type:** System/Configuration
- **Operations:** Create service, Edit service, Delete service, Assign to clients (all or selected)
- **Key Rules:**
  - New services can be "open to all clients" (auto-added to all client service lists)
  - Or "open to selected clients" (admin selects specific clients via checkboxes)
  - Services appear in client's "requested services" dropdown
  - Workers select from same service list for their capabilities
- **Acceptance:** Admins can create services and control which clients can request them

**FR-009: Dashboard Views (Role-Specific)**
- **Description:** Each role has customized dashboard showing relevant information and actions
- **Entity Type:** System Data (aggregated views)
- **Operations:** View dashboard, Filter data, Access quick actions
- **Key Rules:**
  - **Client Dashboard:** Profile tab, Shifts tab (confirmed shifts in time order with location, day, time, worker)
  - **Worker Dashboard:** Shifts tab (confirmed shifts in time order with client, address, contact, day, time), Available shifts (claimable)
  - **Admin Dashboard:** Clients tab (all clients list), Workers tab (all workers list), Services tab (all services), Shifts tab (all shifts in time order)
  - All lists clickable to view/edit details
- **Acceptance:** Each role sees appropriate dashboard with relevant data and actions

---

## 3. USER WORKFLOWS

### 3.1 Primary Workflow: Client Requests Shift → Worker Assignment

**Trigger:** Client needs coverage for upcoming shift
**Outcome:** Qualified worker assigned and confirmed for shift

**Steps:**
1. Client logs in and navigates to shift request form
2. Client selects site, service(s), day, time, and optional repeat pattern
3. Client submits shift request
4. Admin receives notification and sees request in dashboard with "new" badge
5. Admin reviews request and confirms (or edits details)
6. Client receives confirmation notification and sees shift in Shifts tab with "new" badge
7. Admin decides to invite workers (clicks "invite workers" on shift detail)
8. System calculates eligible workers (distance ≤ 50 miles, matching services, matching state license)
9. Eligible workers receive notification and see shift opportunity on dashboard
10. Multiple workers click "claim" button
11. Admin sees list of claimants on shift detail page
12. Admin selects one worker and confirms assignment
13. Selected worker receives notification and confirms assignment
14. Shift appears in worker's Shifts tab with "new" badge
15. Unselected claimants receive "assigned to others" notification
16. Client sees assigned worker name on their Shifts tab

### 3.2 Key Supporting Workflows

**Admin Creates Shift Directly:**
1. Admin navigates to Shifts tab → "Create Shift"
2. Selects client, site, service(s), day, time
3. Either assigns specific worker OR marks "to be determined"
4. If worker assigned: worker receives notification and confirms
5. If TBD: admin can later invite workers (follows claiming workflow)

**Worker Claims Available Shift:**
1. Worker logs in and sees available shifts on dashboard
2. Reviews shift details (client, location, service, time)
3. Clicks "claim" button
4. Admin sees worker in claimants list
5. Admin assigns worker
6. Worker receives confirmation notification

**Client Cancels Shift:**
1. Client navigates to Shifts tab
2. Clicks shift → "Cancel" button
3. Admin receives cancellation request notification
4. Admin confirms cancellation
5. If worker assigned: worker receives cancellation notification
6. Shift removed from all dashboards

**Admin Manages Multi-Site Client:**
1. Admin navigates to Clients tab
2. Clicks client name → sees profile
3. Adds new site with address
4. Adds contact person for site
5. Assigns services available at that site
6. Saves changes
7. Site now available for shift creation

---

## 4. BUSINESS RULES

### 4.1 Worker Eligibility Rules

| Criterion | Rule | Validation |
|-----------|------|------------|
| Distance | Worker address to shift site ≤ 50 miles | Driving distance via mapping API |
| Service | Shift service(s) ⊆ Worker offered services | Set intersection check |
| License | Shift site state ∈ Worker licensed states | State code match |
| Combined | ALL three criteria must be TRUE | AND logic |

### 4.2 Notification Rules

| Event | Recipient | Badge Duration | Content |
|-------|-----------|----------------|---------|
| Shift Request | Admin | 3 days or click | "New shift request from [Client]" |
| Shift Confirmed | Client | 3 days or click | "Shift confirmed for [Date/Time]" |
| Worker Invited | Eligible Workers | 3 days or click | "New shift available: [Details]" |
| Shift Claimed | Admin | 3 days or click | "[Worker] claimed shift [ID]" |
| Worker Assigned | Selected Worker | 3 days or click | "You've been assigned to shift [Details]" |
| Assignment Rejected | Unselected Claimants | Immediate | "Shift assigned to another worker" |
| Cancellation Request | Admin (if client) / Client (if admin) | 3 days or click | "Cancellation request for shift [ID]" |
| Cancellation Confirmed | All parties | Immediate | "Shift [ID] cancelled" |

### 4.3 Data Validation Rules

| Entity | Required Fields | Constraints |
|--------|-----------------|-------------|
| Client | company name, address, contact person (name, email, phone) | Email format valid, phone format valid |
| Worker | name, address, email, phone, license type, licensed states (≥1), services (≥1) | Email unique, license type from enum, states from valid list |
| Admin | name, email, phone | Email unique |
| Site | address, client_id | Address must be geocodable |
| Shift | client_id, site_id, service_ids (≥1), day, start_time, end_time | End time > start time, day ≥ today |
| Service | name | Name unique |

### 4.4 Access Control Rules

| Role | Can Create | Can Edit | Can Delete | Special Permissions |
|------|-----------|----------|------------|---------------------|
| Client | Shift requests, Sites, Contact persons | Own profile, Own sites | Own sites | View own shifts only |
| Worker | Shift claims | Own profile | None | View eligible shifts only |
| Admin | Shifts, Clients, Workers, Services | All entities | All entities | Full system access |

---

## 5. DATA REQUIREMENTS

### 5.1 Core Entities

**User**
- **Type:** System/Configuration | **Storage:** Backend database
- **Key Fields:** id, email (unique), password_hash, role (Client/Worker/Admin), name, address, phone, created_at, updated_at
- **Relationships:** has many Notifications, has many ActivityLogs
- **Lifecycle:** Full CRUD by Admin; users can edit own profile; soft delete preserves audit trail

**Client (extends User)**
- **Type:** User-Generated Content | **Storage:** Backend database
- **Key Fields:** user_id (FK), company_name, requested_services (array)
- **Relationships:** has many Sites, has many ContactPersons, has many Shifts
- **Lifecycle:** Created via registration or by Admin; editable by self or Admin

**Worker (extends User)**
- **Type:** User-Generated Content | **Storage:** Backend database
- **Key Fields:** user_id (FK), license_type (enum), licensed_states (array), services_offered (array)
- **Relationships:** has many ShiftClaims, has many AssignedShifts
- **Lifecycle:** Created via registration or by Admin; editable by self or Admin

**Admin (extends User)**
- **Type:** System/Configuration | **Storage:** Backend database
- **Key Fields:** user_id (FK)
- **Relationships:** creates Shifts, manages all entities
- **Lifecycle:** Created by existing Admin only

**Site**
- **Type:** User-Generated Content | **Storage:** Backend database
- **Key Fields:** id, client_id (FK), address, latitude, longitude, services_available (array), created_at
- **Relationships:** belongs to Client, has many ContactPersons, has many Shifts
- **Lifecycle:** Full CRUD by Client (owner) or Admin; geocoded on creation

**ContactPerson**
- **Type:** User-Generated Content | **Storage:** Backend database
- **Key Fields:** id, site_id (FK), name, email, phone
- **Relationships:** belongs to Site
- **Lifecycle:** Full CRUD by Client (owner) or Admin

**Service**
- **Type:** System/Configuration | **Storage:** Backend database
- **Key Fields:** id, name (unique), description, created_by (admin_id), created_at
- **Relationships:** referenced by Shifts, Workers, Clients
- **Lifecycle:** Full CRUD by Admin only

**Shift**
- **Type:** User-Generated Content | **Storage:** Backend database
- **Key Fields:** id, client_id (FK), site_id (FK), service_ids (array), day (date), start_time, end_time, repeat_pattern (optional), status (Requested/Confirmed/Assigned/Cancelled), assigned_worker_id (FK, nullable), created_by (user_id), created_at, updated_at
- **Relationships:** belongs to Client, belongs to Site, has many ShiftClaims, belongs to Worker (assigned)
- **Lifecycle:** Created by Client (request) or Admin; requires confirmation; assignable to Worker; cancellable with confirmation

**ShiftClaim**
- **Type:** System Data | **Storage:** Backend database
- **Key Fields:** id, shift_id (FK), worker_id (FK), status (Pending/Accepted/Rejected), claimed_at
- **Relationships:** belongs to Shift, belongs to Worker
- **Lifecycle:** Created when worker claims; updated when admin assigns; immutable after assignment

**Notification**
- **Type:** System Data | **Storage:** Backend database
- **Key Fields:** id, user_id (FK), type (enum), content (JSON), is_read (boolean), created_at, auto_clear_at (created_at + 3 days)
- **Relationships:** belongs to User
- **Lifecycle:** Auto-created by system events; marked read by user; auto-deleted after 30 days

**EligibilityCache**
- **Type:** System Data | **Storage:** Backend database (optional - can be calculated on-demand)
- **Key Fields:** id, shift_id (FK), worker_id (FK), distance_miles, service_match (boolean), license_match (boolean), is_eligible (boolean), calculated_at
- **Relationships:** references Shift, references Worker
- **Lifecycle:** Calculated when shift created/updated; cached for performance; recalculated if worker/shift details change

### 5.2 Data Storage Strategy
- **Primary Storage:** PostgreSQL database with PostGIS extension for geospatial queries
- **Capacity:** Designed for 10,000+ workers, 1,000+ clients, 100,000+ shifts annually
- **Persistence:** All data persists indefinitely; soft deletes for user-generated content
- **Audit Fields:** All entities include created_at, updated_at, created_by for full traceability
- **Real-Time Sync:** WebSocket connections for instant notification delivery

---

## 6. INTEGRATION REQUIREMENTS

### 6.1 Required Integrations (MVP)

**Distance Calculation API**
- **Provider:** Google Maps Distance Matrix API or similar
- **Purpose:** Calculate driving distance between worker address and shift site
- **Usage:** Called when shift created/updated or worker profile updated
- **Fallback:** Haversine formula for straight-line distance if API unavailable

### 6.2 Future Integrations (Post-MVP)

- **SMS Notifications:** Twilio for text message alerts
- **Email Service:** SendGrid for email notifications
- **Calendar Integration:** Google Calendar / Outlook for shift sync
- **Background Check:** Checkr or similar for worker verification
- **Payment Processing:** Stripe for worker payments

---

## 7. VIEWS & NAVIGATION

### 7.1 Client Views

**Profile Tab** (`/client/profile`)
- Company information display
- Sites list with addresses
- Contact persons per site
- Requested services
- Edit buttons for all sections

**Shifts Tab** (`/client/shifts`)
- Table of confirmed shifts sorted by date/time
- Columns: Site, Service(s), Day, Time, Assigned Worker, Status
- "New" badges on recently confirmed shifts
- Click row to view details
- "Request Shift" button
- "Cancel" button per shift

**Shift Request Form** (`/client/shifts/new`)
- Site selector (dropdown of client's sites)
- Service selector (multi-select from requested services)
- Date picker
- Time range picker (start/end)
- Repeat pattern (optional: daily, weekly, custom)
- Notes field
- Submit button

### 7.2 Worker Views

**Dashboard** (`/worker/dashboard`)
- Available shifts section (claimable shifts with "new" badges)
- Each shift shows: Client name, Location, Service(s), Day, Time, Distance
- "Claim" button per shift
- Confirmed shifts section

**Shifts Tab** (`/worker/shifts`)
- Table of confirmed/assigned shifts sorted by date/time
- Columns: Client, Address, Contact Person, Service(s), Day, Time, Status
- "New" badges on recently assigned shifts
- Click row to view details
- "Confirm" button for newly assigned shifts

**Profile Tab** (`/worker/profile`)
- Personal information
- License type and licensed states
- Services offered (multi-select)
- Edit buttons

### 7.3 Admin Views

**Clients Tab** (`/admin/clients`)
- Searchable table of all clients
- Columns: Company Name, # Sites, # Active Shifts, Last Activity
- "Add Client" button
- Click row to view/edit client details

**Client Detail** (`/admin/clients/:id`)
- Full client profile
- Sites list with edit/delete
- Contact persons with edit/delete
- Shift history
- "Add Site" and "Add Contact" buttons

**Workers Tab** (`/admin/workers`)
- Searchable table of all workers
- Columns: Name, License Type, Licensed States, Services, # Active Shifts
- "Add Worker" button
- Click row to view/edit worker details

**Worker Detail** (`/admin/workers/:id`)
- Full worker profile
- License information
- Services offered
- Shift history
- Edit buttons

**Services Tab** (`/admin/services`)
- List of all services
- "Add Service" button
- Edit/delete per service
- Client assignment interface

**Service Form** (`/admin/services/new`)
- Service name
- Description
- Assignment options:
  - "Open to all clients" (checkbox)
  - "Open to selected clients" (multi-select with checkboxes)
- Save button

**Shifts Tab** (`/admin/shifts`)
- Comprehensive shift calendar/table
- Columns: Client, Site, Service(s), Day, Time, Assigned Worker, Status
- Filters: Date range, Client, Worker, Status
- "Create Shift" button
- Click row to view/edit shift details

**Shift Detail** (`/admin/shifts/:id`)
- Full shift information
- Client and site details
- Service(s) listed
- Assigned worker (if any)
- Claimants list (if any)
- "Invite Workers" button (if no worker assigned)
- "Assign Worker" dropdown (from claimants)
- "Edit" and "Cancel" buttons

**Shift Form** (`/admin/shifts/new`)
- Client selector
- Site selector (filtered by selected client)
- Service selector (multi-select)
- Date picker
- Time range picker
- Worker assignment:
  - "Assign specific worker" (dropdown)
  - "To be determined" (checkbox)
- Repeat pattern (optional)
- Save button

### 7.4 Navigation Structure

**Client Nav:** Dashboard | Profile | Shifts | Logout
**Worker Nav:** Dashboard | Profile | Shifts | Logout
**Admin Nav:** Dashboard | Clients | Workers | Services | Shifts | Logout

**Mobile:** Hamburger menu with collapsible navigation; responsive tables with horizontal scroll; touch-friendly buttons

---

## 8. MVP SCOPE & CONSTRAINTS

### 8.1 MVP Success Definition

The MVP is successful when:
- ✅ All three user roles can register and manage profiles
- ✅ Clients can manage multiple sites with contact persons
- ✅ Shifts can be created by clients (request) or admins (direct)
- ✅ System correctly identifies eligible workers (distance + service + license)
- ✅ Workers can claim shifts and admins can assign from claimants
- ✅ Real-time notifications work for all lifecycle events
- ✅ "New" badges appear and auto-clear after 3 days or click
- ✅ Cancellation workflow functions with proper confirmations
- ✅ Multi-state licensing validation works correctly
- ✅ Distance calculations accurate within 5 miles
- ✅ System handles 100+ concurrent users without performance issues

### 8.2 In Scope for MVP

Core features included:
- FR-001: Multi-Role User Registration & Authentication
- FR-002: Client Multi-Site Management
- FR-003: Shift Creation & Management
- FR-004: Intelligent Worker Eligibility Matching
- FR-005: Shift Claiming & Assignment Workflow
- FR-006: Real-Time Notification System
- FR-007: Shift Cancellation Workflow
- FR-008: Admin Service Management
- FR-009: Dashboard Views (Role-Specific)

Supporting features:
- Distance calculation via external API
- Geolocation of addresses
- Multi-state licensing validation
- Service matching logic
- Audit logging for all actions
- Search and filter across all lists
- Mobile-responsive design

### 8.3 Technical Constraints

- **Data Storage:** PostgreSQL with PostGIS extension for geospatial queries
- **Concurrent Users:** Designed for 100+ simultaneous users
- **Performance:** Page loads <2s on 3G connection; eligibility calculations <1s
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile:** Responsive design, iOS/Android browser support
- **Offline:** Not supported in MVP; requires internet connection
- **Distance API:** Rate limited to 1000 requests/day (caching required)
- **Notifications:** In-app only (no SMS/email in MVP)

### 8.4 Known Limitations

**For MVP:**
- **No SMS/Email Notifications:** In-app notifications only; users must be logged in to receive alerts
- **No Calendar Integration:** Shifts not synced to external calendars
- **No Payment Processing:** No worker payment or invoicing features
- **No Background Checks:** Worker verification manual; no automated background check integration
- **No Mobile App:** Web-only; no native iOS/Android apps
- **No Shift Swapping:** Workers cannot trade shifts with each other
- **No Availability Management:** Workers cannot block out unavailable dates
- **No Automated Reminders:** No automatic shift reminder notifications

**Future Enhancements:**
- V2: SMS and email notifications via Twilio/SendGrid
- V2: Calendar integration (Google Calendar, Outlook)
- V2: Worker availability calendar with blackout dates
- V3: Payment processing and invoicing
- V3: Background check integration
- V3: Native mobile apps with push notifications
- V3: Shift swapping between workers
- V3: Automated shift reminders (24h before, 1h before)
- V3: Analytics dashboard for admins (fill rates, worker performance, etc.)

---

## 9. ASSUMPTIONS & DECISIONS

### 9.1 Platform Decisions
- **Type:** Full-stack web application (Next.js frontend + FastAPI backend + PostgreSQL)
- **Storage:** Backend database with PostGIS for geospatial queries
- **Auth:** JWT tokens with role-based access control
- **Notifications:** WebSocket for real-time in-app notifications

### 9.2 Key Assumptions

1. **50-Mile Distance Threshold**
   - Reasoning: Balances worker convenience with client coverage needs; typical commute tolerance for healthcare workers
   - Validation: Driving distance via mapping API, not straight-line

2. **Three-Criteria Eligibility (AND Logic)**
   - Reasoning: All three must be met to ensure worker is qualified, licensed, and within reasonable distance
   - No partial matches or "close enough" scenarios

3. **Admin Confirmation Required**
   - Reasoning: Maintains quality control; admin reviews all shift requests and cancellations before finalizing
   - Prevents accidental or fraudulent requests

4. **Multi-Claim, Single-Assignment**
   - Reasoning: Allows competitive claiming while giving admin final decision; prevents first-come-first-served issues
   - Admin can evaluate all interested workers before assigning

5. **3-Day Auto-Clear for "New" Badges**
   - Reasoning: Balances urgency with user convenience; prevents badge fatigue while ensuring timely attention
   - User can manually clear by clicking

6. **In-App Notifications Only (MVP)**
   - Reasoning: Reduces complexity and external dependencies; users expected to check portal regularly
   - SMS/email deferred to V2 based on user feedback

7. **No Shift Editing After Assignment**
   - Reasoning: Prevents confusion and maintains audit trail; cancellation and recreation preferred over editing
   - Protects worker from last-minute changes

### 9.3 Design Decisions

**Distance Calculation:**
- Use Google Maps Distance Matrix API for driving distance
- Cache results to minimize API calls
- Fallback to Haversine formula if API unavailable
- Recalculate only when addresses change

**Notification Delivery:**
- WebSocket connections for real-time delivery
- Fallback to polling every 30s if WebSocket fails
- Persist notifications in database for reliability
- Auto-delete after 30 days to manage storage

**Eligibility Caching:**
- Calculate eligibility when shift created/updated
- Cache results in database for performance
- Invalidate cache when worker profile or shift details change
- Recalculate on-demand if cache miss

**Multi-State Licensing:**
- Store licensed states as array in worker profile
- Validate against US state codes (50 states + DC)
- Allow workers to add/remove states anytime
- No expiration tracking in MVP (manual verification)

---

**PRD Complete - Ready for Development**