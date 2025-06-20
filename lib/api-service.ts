const API_BASE_URL =  "http://localhost"

class RuralSyncApiService {
      // Request util
      private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
            const url = `${API_BASE_URL}${endpoint}`
            const headers: HeadersInit = {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`
            }

           try {
               const response = await fetch(url, {
                   ...options,
                   headers
               })

               if (!response.ok) {
                   throw new Error("Network response was not ok")
               }

               return response.json()
           } catch (error) {
               console.error("Error:", error)
               throw error
           }
      }

      // Authentication

      // Register 
      async register(userData :{
            name: string
            email: string
            password: string
            phone: string
            address: string
            role: string
      }): Promise<void> {
            const endpoint = "/auth/register"
            const body = JSON.stringify(userData)

            await this.request(endpoint, {
                  method: "POST",
                  body
            })
      }
      async login(email: string, password: string , role: string): Promise<void> {
            return this.request("/auth/login", {
                  method: "POST",
                  body: JSON.stringify({ email, password , role }),
            })
      }


}


export const apiService = new RuralSyncApiService()
