// 这个文件导出的方法将暴露给客户端调用，第一个参数固定为当前 socket 对象
// import { SYNC_CLOSE_CODE } from '@/constants'
import { SYNC_CLOSE_CODE } from '@/constants'
import { getUserSpace } from '@/user'

const handleUserApiAction = async(userName: string, param: LX.Sync.UserApi.ActionList) => {
  console.log('handleUserApiAction', userName, param.action)
  switch (param.action) {
    case 'user_api_data_overwrite':
      await global.event_userApi.user_api_data_overwrite(userName, param.data, true)
      break
    default:
      throw new Error('unknown user api sync action')
  }
  const userSpace = getUserSpace(userName)
  const key = await userSpace.userApiManage.createSnapshot()
  return key
}
const handler: LX.Sync.ServerSyncHandlerUserApiActions<LX.Socket> = {
  async onUserApiSyncAction(socket, action) {
    if (!socket.moduleReadys?.userApi) return
    const key = await handleUserApiAction(socket.userInfo.name, action)
    console.log('user api action snapshot key', key)
    const userSpace = getUserSpace(socket.userInfo.name)
    const currentUserName = socket.userInfo.name
    const currentId = socket.keyInfo.clientId
    socket.broadcast((client) => {
      if (client.keyInfo.clientId == currentId || !client.moduleReadys?.userApi || client.userInfo.name != currentUserName) return
      void client.remoteQueueUserApi.onUserApiSyncAction(action).then(async() => {
        return userSpace.userApiManage.updateDeviceSnapshotKey(client.keyInfo.clientId, key)
      }).catch(err => {
        // TODO send status
        client.close(SYNC_CLOSE_CODE.failed)
        console.log(err.message)
      })
    })
  },
}

export default handler
