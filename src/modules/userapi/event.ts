import { getUserSpace } from '@/user'
import { EventEmitter } from 'events'

export class UserApiEvent extends EventEmitter {
  user_api_changed() {
    this.emit('user_api_changed')
  }

  /**
   * 覆盖整个自定义源数据
   * @param userName 用户名
   * @param userApiData 自定义源数据
   * @param isRemote 是否属于远程操作
   */
  async user_api_data_overwrite(userName: string, userApiData: LX.UserApi.UserApiData, isRemote: boolean = false) {
    const userSpace = getUserSpace(userName)
    await userSpace.userApiManage.userApiDataManage.overwirteUserApiInfo(userApiData)
    this.emit('user_api_data_overwrite', userName, userApiData, isRemote)
  }
}


type EventMethods = Omit<EventType, keyof EventEmitter>
declare class EventType extends UserApiEvent {
  on<K extends keyof EventMethods>(event: K, listener: EventMethods[K]): this
  once<K extends keyof EventMethods>(event: K, listener: EventMethods[K]): this
  off<K extends keyof EventMethods>(event: K, listener: EventMethods[K]): this
}
export type UserApiEventType = Omit<EventType, keyof Omit<EventEmitter, 'on' | 'off' | 'once'>>
