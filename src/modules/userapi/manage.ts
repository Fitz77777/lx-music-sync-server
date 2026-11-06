import { type UserDataManage } from '@/user'
import { SnapshotDataManage } from './snapshotDataManage'
import { UserApiDataManage } from './userApiDataManage'
import { toMD5 } from '@/utils'
import { serializeUserApiData } from './utils'

export class UserApiManage {
  snapshotDataManage: SnapshotDataManage
  userApiDataManage: UserApiDataManage

  constructor(userDataManage: UserDataManage) {
    this.snapshotDataManage = new SnapshotDataManage(userDataManage)
    this.userApiDataManage = new UserApiDataManage(this.snapshotDataManage)
  }

  createSnapshot = async() => {
    const data = await this.getUserApiData()
    const md5 = toMD5(serializeUserApiData(data))
    const snapshotInfo = await this.snapshotDataManage.getSnapshotInfo()
    console.log('createSnapshot', md5, snapshotInfo.latest)
    if (snapshotInfo.latest == md5) return md5
    if (snapshotInfo.list.includes(md5)) {
      snapshotInfo.list.splice(snapshotInfo.list.indexOf(md5), 1)
    } else await this.snapshotDataManage.saveSnapshot(md5, serializeUserApiData(data))
    if (snapshotInfo.latest) snapshotInfo.list.unshift(snapshotInfo.latest)
    snapshotInfo.latest = md5
    snapshotInfo.time = Date.now()
    this.snapshotDataManage.saveSnapshotInfo(snapshotInfo)
    return md5
  }

  getCurrentDataKey = async() => {
    const snapshotInfo = await this.snapshotDataManage.getSnapshotInfo()
    if (snapshotInfo.latest) return snapshotInfo.latest
    return this.createSnapshot()
  }

  getDeviceCurrentSnapshotKey = async(clientId: string) => {
    return this.snapshotDataManage.getDeviceCurrentSnapshotKey(clientId)
  }

  updateDeviceSnapshotKey = async(clientId: string, key: string) => {
    await this.snapshotDataManage.updateDeviceSnapshotKey(clientId, key)
  }

  removeDevice = async(clientId: string) => {
    this.snapshotDataManage.removeSnapshotInfo(clientId)
  }

  getUserApiData = async() => {
    return await this.userApiDataManage.getUserApiData()
  }
}
