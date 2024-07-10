import { systemRoles } from '../../../../utilities/systemRoles.js'
const APIroles = {
    getRecentChat: [systemRoles.tourist, systemRoles.tourGuide],
    getChat: [systemRoles.tourist, systemRoles.tourGuide],
    getTGMeta: [systemRoles.tourist, systemRoles.tourGuide],
    sendMessage: [systemRoles.tourist, systemRoles.tourGuide]
}

export default APIroles
