import { systemRoles } from "../../../utilities/systemRoles.js"

export const touristAPIroles = {
    profile_setUp: [systemRoles.tourist],
    changePassword: [systemRoles.tourist],
    deleteUser: [systemRoles.tourist],
    logout: [systemRoles.tourist],
    getUserInfo: [systemRoles.tourist],
    addTrip: [],
    generateTrip: [],
    toggleToFavs: [systemRoles.tourist],
    getAllFavPlaces: [systemRoles.tourist]
}