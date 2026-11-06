import { type SnapshotDataManage } from './snapshotDataManage'
import { checkUserApiData, parseUserApiData } from './utils'

export class UserApiDataManage {
  snapshotDataManage: SnapshotDataManage
  private userApiData: LX.UserApi.UserApiData = { apis: [], scripts: {} }

  constructor(snapshotDataManage: SnapshotDataManage) {
    this.snapshotDataManage = snapshotDataManage

    // 构造时同步读取最新快照数据，避免异步加载竞态
    const snapshotInfo = this.snapshotDataManage.snapshotInfo
    if (snapshotInfo.latest) {
      const data = parseUserApiData(this.snapshotDataManage.getSnapshotSync(snapshotInfo.latest) ?? '')
      this.userApiData = data ? checkUserApiData(data) : { apis: [], scripts: {} }
    }
  }

  getUserApiData = async(): Promise<LX.UserApi.UserApiData> => {
    return this.userApiData
  }

  overwirteUserApiInfo = async(data: LX.UserApi.UserApiData) => {
    this.userApiData = checkUserApiData(data)
    return this.userApiData
  }
}
