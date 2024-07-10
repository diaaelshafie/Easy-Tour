import {
    ChatCont, ChatRoles, ChatVS, asyncHandler, isAuth, multerCallBackVersion,
    multerHostFunction, multertempFunction, validationCoreFunction, Router
} from './routes.imports.js'

const router = Router()

router.get(
    '/getNowTime',
    asyncHandler(ChatCont.MomentTest)
)

router.post(
    '/AddChatManually',
    asyncHandler(ChatCont.AddChatManually)
)

router.get(
    '/getRecentChats',
    validationCoreFunction(ChatVS.getRecentChatsSchema),
    isAuth(ChatRoles.getRecentChat),
    asyncHandler(ChatCont.getRecentChats)
)

router.get(
    '/getChat',
    validationCoreFunction(ChatVS.getChatSchema),
    isAuth(ChatRoles.getChat),
    asyncHandler(ChatCont.getChat)
)

router.get(
    '/getTGMeta',
    validationCoreFunction(ChatVS.getTGMetaSchema),
    isAuth(ChatRoles.getTGMeta),
    asyncHandler(ChatCont.getTGMeta)
)

router.post(
    '/sendMessage',
    validationCoreFunction(ChatVS.sendMessageSchema),
    isAuth(ChatRoles.sendMessage),
    asyncHandler(ChatCont.sendMessage)
)

export default router