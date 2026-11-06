import { sync as listSync } from './list'
import { sync as dislikeSync } from './dislike'
import { sync as userApiSync } from './userapi'

export const callObj = Object.assign({},
  listSync.handler,
  dislikeSync.handler,
  userApiSync.handler,
)

export const modules = {
  list: listSync,
  dislike: dislikeSync,
  userApi: userApiSync,
}


export { ListManage, ListEvent, type ListEventType } from './list'

export { DislikeManage, DislikeEvent, type DislikeEventType } from './dislike'

export { UserApiManage, UserApiEvent, type UserApiEventType } from './userapi'

export const featureVersion = {
  list: 1,
  dislike: 1,
  userApi: 1,
} as const
