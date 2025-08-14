import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // This tells the Vercel build tool: "Do not try to bundle react-icons.
      // It is external." This is the command the error log has been asking for.
      external: [
        /^react-icons(\/.*)?$/,
      ]
    }
  }
})```
*This regular expression (`/^react-icons(\/.*)?$/`) is a robust way of telling the builder to treat `react-icons/hi`, `react-icons/io5`, and any other `react-icons` import as external, which is exactly what the error log suggested.*

**Step 2: Final Verification (Do Not Change This Code)**

Just to be 100% certain, make sure your imports in `src/components/MainLayout/MainLayout.jsx` look like this. This is the correct version.

```javascript
import { HiMenu, HiOutlinePlus, HiOutlineCog, HiOutlineLogout } from 'react-icons/hi';
import { IoSend } from "react-icons/io5";