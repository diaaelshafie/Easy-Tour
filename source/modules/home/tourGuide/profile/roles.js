import { systemRoles } from '../../../../utilities/systemRoles.js'

export const profileAPIroles = {
    logout: [systemRoles.tourist, systemRoles.tourGuide],
    getUserInfo: [systemRoles.tourist, systemRoles.tourGuide],
    updateProfile: systemRoles.tourGuide
}