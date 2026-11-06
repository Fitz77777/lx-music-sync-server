import { type SnapshotDataManage } from './snapshotDataManage'
import { checkUserApiData, parseUserApiData } from './utils'

export class UserApiDataManage {
  snapshotDataManage: SnapshotDataManage
  private userApiData: LX.UserApi.UserApiData = { apis: [], scripts: {} }
  // 激活源选择：不参与快照/md5，仅随“完全覆盖”类同步流程传递（null = 不携带）
  private apiSource: string | null = null

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
    return { ...this.userApiData, apiSource: this.apiSource }
  }

  overwirteUserApiInfo = async(data: LX.UserApi.UserApiData) => {
    this.userApiData = checkUserApiData(data)
    // 仅在完全覆盖类流程（携带真实选择）时更新；合并流程携带 null，保持现有选择
    if (data.apiSource != null) this.apiSource = data.apiSource
    return this.getUserApiData()
  }
}
