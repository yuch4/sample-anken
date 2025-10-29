import { mockUsers, mockProjects, mockActivities, mockMonthlyTargets, mockCurrentUser } from './mock-data'

type MockData = {
  users: typeof mockUsers
  projects: typeof mockProjects
  activities: typeof mockActivities
  monthly_targets: typeof mockMonthlyTargets
}

const mockData: MockData = {
  users: [...mockUsers],
  projects: [...mockProjects],
  activities: [...mockActivities],
  monthly_targets: [...mockMonthlyTargets],
}

// モックSupabaseクライアント
export function createMockClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: mockCurrentUser.id, email: mockCurrentUser.email } },
        error: null,
      }),
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const user = mockData.users.find((u) => u.email === email)
        if (user && password === 'password') {
          return { data: { user: { id: user.id, email: user.email } }, error: null }
        }
        return { data: { user: null }, error: { message: 'Invalid credentials' } }
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        const newUser = {
          id: `mock-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'user' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockData.users.push(newUser)
        return { data: { user: { id: newUser.id, email: newUser.email } }, error: null }
      },
      signOut: async () => ({ error: null }),
    },
    from: (table: keyof MockData) => ({
      select: (columns: string = '*') => {
        let data = [...mockData[table]]
        
        const chainable = {
          eq: (column: string, value: any) => {
            data = data.filter((item: any) => item[column] === value)
            return chainable
          },
          neq: (column: string, value: any) => {
            data = data.filter((item: any) => item[column] !== value)
            return chainable
          },
          is: (column: string, value: any) => {
            data = data.filter((item: any) => item[column] === value)
            return chainable
          },
          gte: (column: string, value: any) => {
            data = data.filter((item: any) => item[column] >= value)
            return chainable
          },
          lte: (column: string, value: any) => {
            data = data.filter((item: any) => item[column] <= value)
            return chainable
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            const asc = options?.ascending ?? true
            data.sort((a: any, b: any) => {
              if (a[column] < b[column]) return asc ? -1 : 1
              if (a[column] > b[column]) return asc ? 1 : -1
              return 0
            })
            return chainable
          },
          limit: (count: number) => {
            data = data.slice(0, count)
            return chainable
          },
          single: async () => {
            // プロジェクトの場合、assigned_userを含める
            if (table === 'projects' && data.length > 0) {
              const project = data[0] as any
              const user = mockData.users.find(u => u.id === project.assigned_user_id)
              return { data: { ...project, assigned_user: user }, error: null }
            }
            // アクティビティの場合、userを含める
            if (table === 'activities' && data.length > 0) {
              const enrichedData = data.map((activity: any) => {
                const user = mockData.users.find(u => u.id === activity.user_id)
                return { ...activity, user }
              })
              return { data: enrichedData[0], error: null }
            }
            return { data: data[0] || null, error: data[0] ? null : { message: 'Not found' } }
          },
          then: async (resolve: any) => {
            // プロジェクトの場合、assigned_userを含める
            if (table === 'projects') {
              const enrichedData = data.map((project: any) => {
                const user = mockData.users.find(u => u.id === project.assigned_user_id)
                return { ...project, assigned_user: user }
              })
              return resolve({ data: enrichedData, error: null })
            }
            // アクティビティの場合、userを含める
            if (table === 'activities') {
              const enrichedData = data.map((activity: any) => {
                const user = mockData.users.find(u => u.id === activity.user_id)
                return { ...activity, user }
              })
              return resolve({ data: enrichedData, error: null })
            }
            return resolve({ data, error: null })
          },
        }
        
        return chainable
      },
      insert: async (values: any) => {
        const newItem = {
          id: `mock-${Date.now()}-${Math.random()}`,
          ...values,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        ;(mockData[table] as any[]).push(newItem)
        return { data: newItem, error: null }
      },
      update: (values: any) => ({
        eq: async (column: string, value: any) => {
          const index = (mockData[table] as any[]).findIndex((item: any) => item[column] === value)
          if (index !== -1) {
            ;(mockData[table] as any[])[index] = {
              ...(mockData[table] as any[])[index],
              ...values,
              updated_at: new Date().toISOString(),
            }
            return { data: (mockData[table] as any[])[index], error: null }
          }
          return { data: null, error: { message: 'Not found' } }
        },
      }),
      delete: () => ({
        eq: async (column: string, value: any) => {
          const index = (mockData[table] as any[]).findIndex((item: any) => item[column] === value)
          if (index !== -1) {
            const deleted = (mockData[table] as any[]).splice(index, 1)
            return { data: deleted[0], error: null }
          }
          return { data: null, error: { message: 'Not found' } }
        },
      }),
    }),
  }
}
