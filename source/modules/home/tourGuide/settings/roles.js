import { systemRoles } from "../../../../utilities/systemRoles.js"

export const settingsAPIroles = {
    changePassword: [systemRoles.tourist, systemRoles.tourGuide], // confirm old pass and change old pass
    deleteUser: [systemRoles.tourist, systemRoles.tourGuide]
}