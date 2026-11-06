// 这个文件导出的方法将暴露给客户端调用，第一个参数固定为当前 socket 对象
import { SYNC_CLOSE_CODE } from '@/constants'
import { getUserSpace } from '@/user'
import { serializeUserApiData } from '../utils'

const applyActionToData = (current: LX.UserApi.UserApiData, action: LX.Sync.UserApi.ActionList): LX.UserApi.UserApiData => {
  const apiSource = current.apiSource ?? null
  switch (action.action) {
    case 'user_api_add': {
      if (current.apis.some(api => api.id == action.data.api.id)) return current
      return {
        apis: [...current.apis, action.data.api],
        scripts: { ...current.scripts, [action.data.api.id]: action.data.script },
        apiSource,
      }
    }
    case 'user_api_update': {
      const index = current.apis.findIndex(api => api.id == action.data.api.id)
      if (index < 0) return current
      const apis = [...current.apis]
      apis[index] = action.data.api
      const scripts = { ...current.scripts }
      if (typeof action.data.script == 'string' && action.data.script != '') {
        scripts[action.data.api.id] = action.data.script
      }
      return { apis, scripts, apiSource }
    }
    case 'user_api_remove': {
      const ids = new Set(action.data.ids)
      if (!current.apis.some(api => ids.has(api.id))) return current
      const apis = current.apis.filter(api => !ids.has(api.id))
      const scripts = { ...current.scripts }
      for (const id of ids) delete scripts[id]
      return { apis, scripts, apiSource }
    }
    case 'user_api_active': {
      if (action.data.id == apiSource) return current
      // 允许 null：表示当前未激活任何自定义源
      return { apis: current.apis, scripts: current.scripts, apiSource: action.data.id }
    }
    case 'user_api_data_overwrite':
      return action.data
    default:
      throw new Error('unknown user api sync action')
  }
}

const handleUserApiAction = async(userName: string, action: LX.Sync.UserApi.ActionList) => {
  console.log('handleUserApiAction', userName, action.action)
  const userSpace = getUserSpace(userName)
  const current = await userSpace.userApiManage.getUserApiData()
  const beforeSignature = serializeUserApiData(current) + '|' + (current.apiSource ?? '')
  const next = applyActionToData(current, action)
  await global.event_userApi.user_api_data_overwrite(userName, next, true)
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
    // 幂等去重：动作对服务端状态没有实际影响时不再广播，避免重复/回声推送
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
