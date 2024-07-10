import { systemRoles } from "../../../../../utilities/systemRoles.js"

export const BookingRoles = {
    GetTG_trips: [systemRoles.tourist],
    BookATrip: [systemRoles.tourist],
    viewTourGuide: [systemRoles.tourist]
}