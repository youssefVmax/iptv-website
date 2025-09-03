@@ .. @@
 interface LoginPageProps {
-  onLogin: (role: "manager" | "salesman" | "customer-service", userData: { name: string; username: string }) => void
+  onLogin: (role: "manager" | "salesman" | "customer-service", userData: { name: string; username: string; password?: string }) => Promise<boolean>
   onBack: () => void
 }

@@ .. @@
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     setIsLoading(true)
     setError("")

-    await new Promise((resolve) => setTimeout(resolve, 1500))
-
-    let authenticatedUser = null
-
-    // Validate credentials based on selected role
-    if (selectedRole === "salesman") {
-      authenticatedUser = SALES_USERS.find((user) => user.username === username && user.password === password)
-    } else if (selectedRole === "manager") {
-      authenticatedUser = MANAGER_USERS.find((user) => user.username === username && user.password === password)
-    } else if (selectedRole === "customer-service") {
-      authenticatedUser = SUPPORT_USERS.find((user) => user.username === username && user.password === password)
-    }
-
-    if (authenticatedUser) {
-      const userData = {
-        name: authenticatedUser.name,
-        username: authenticatedUser.username,
-      }
-      onLogin(selectedRole, userData)
-    } else {
+    try {
+      const userData = {
+        name: username, // Will be updated after successful auth
+        username: username,
+        password: password
+      }
+      
+      const success = await onLogin(selectedRole, userData)
+      
+      if (!success) {
+        setError("Invalid username or password. Please check your credentials.")
+      }
+    } catch (error) {
       setError("Invalid username or password. Please check your credentials.")
+    } finally {
+      setIsLoading(false)
     }
-
-    setIsLoading(false)
   }