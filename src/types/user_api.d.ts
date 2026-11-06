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
    }
  }
}
