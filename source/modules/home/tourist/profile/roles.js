import { systemRoles } from "../../../../utilities/systemRoles.js"

export const profileAPIroles = {
    getAllFavPlaces: [systemRoles.tourist],
    logout: [systemRoles.tourist],
    getUserInfo: [systemRoles.tourist],
    profile_setUp: [systemRoles.tourist],
}