// 这个文件导出的方法将暴露给客户端调用，第一个参数固定为当前 socket 对象
// import { SYNC_CLOSE_CODE } from '@/constants'
import { SYNC_CLOSE_CODE } from '@/constants'
import { getUserSpace } from '@/user'
import { serializeUserApiData } from '../utils'

const handleUserApiAction = async(userName: string, param: LX.Sync.UserApi.ActionList) => {
  console.log('handleUserApiAction', userName, param.action)
  const userSpace = getUserSpace(userName)
  const before = await userSpace.userApiManage.getUserApiData()
  const beforeSignature = serializeUserApiData(before) + '|' + (before.apiSource ?? '')
  switch (param.action) {
    case 'user_api_data_overwrite':
      await global.event_userApi.user_api_data_overwrite(userName, param.data, true)
      break
    default:
      throw new Error('unknown user api sync action')
  }
  const after = await userSpace.userApiManage.getUserApiData()
  const afterSignature = serializeUserApiData(after) + '|' + (after.apiSource ?? '')
  const key = await userSpace.userApiManage.createSnapshot()
  return { key, changed: beforeSignature != afterSignature }
}
const handler: LX.Sync.ServerSyncHandlerUserApiActions<LX.Socket> = {
  async onUserApiSyncAction(socket, action) {
    if (!socket.moduleReadys?.userApi) return
    const { key, changed } = await handleUserApiAction(socket.userInfo.name, action)
    console.log('user api action snapshot key', key, 'changed', changed)
    // 幂等去重：数据与激活源都与服务端当前状态一致时直接忽略，
    // 避免客户端把收到的远端数据原样推回形成无限回声。
    if (!changed) return
    const currentUserName = socket.userInfo.name
    const currentId = socket.keyInfo.clientId
    socket.broadcast((client) => {
      if (client.keyInfo.clientId == currentId || !client.moduleReadys?.userApi || client.userInfo.name != currentUserName) return
      // 不推进目标设备的快照 key：推送可能被对方忽略（未就绪）或丢失，
      // 由对方下次连接时的 md5 对比决定是否需要基于其旧快照重新合并。
      void client.remoteQueueUserApi.onUserApiSyncAction(action).catch(err => {
        // TODO send status
        client.close(SYNC_CLOSE_CODE.failed)
        console.log(err.message)
      })
    })
  },
}

export default handler
