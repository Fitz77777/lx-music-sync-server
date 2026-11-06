declare namespace LX {
  namespace UserApi {
    interface UserApiSourceInfo {
      name: string
      type: string
      actions: string[]
      qualitys: string[]
    }

    type UserApiSources = Record<string, UserApiSourceInfo>

    interface UserApiInfo {
      id: string
      name: string
      description: string
      allowShowUpdateAlert: boolean
      author: string
      homepage: string
      version: string
      sources?: UserApiSources
    }

    interface UserApiData {
      apis: UserApiInfo[]
      scripts: Record<string, string>
      /**
       * 激活源（同步传输用）：仅“完全覆盖”类同步流程携带真实值，
       * 合并/推送流程为 null（接收端忽略）；不参与 md5/快照序列化
       */
      apiSource?: string | null
    }
  }
}
