"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Edit, Trash2, Plus, User, X, Upload, Check } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicInput } from "@/components/ui-elements/neumorphic-input"
import Image from "next/image"
import { User as UserType, createUser, updateUser, deleteUser, getAllUsers } from "@/lib/data-service"
import { UserAvatar } from "@/components/user-avatar"

export function UserManager() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Partial<UserType> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Open modal for creating or editing a user
  const openUserModal = (user?: UserType) => {
    if (user) {
      setCurrentUser({ ...user })
    } else {
      setCurrentUser({
        name: "",
        email: "",
        password: "",
        role: "user",
        events: [],
        avatar: "/default.png"
      })
    }
    setImagePreview(user?.avatar || "/default.png")
    setIsModalOpen(true)
  }

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false)
    setIsDeleteModalOpen(false)
    setCurrentUser(null)
    setImageFile(null)
    setImagePreview(null)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        [name]: value
      })
    }
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    
    if (file) {
      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save the user (create or update)
  const saveUser = async () => {
    if (!currentUser) return
    
    try {
      if (currentUser.id) {
        // Update existing user
        await updateUser(currentUser.id, currentUser, imageFile || undefined)
      } else {
        // Create new user
        await createUser(currentUser as any, imageFile || undefined)
      }
      
      // Refresh users list
      await fetchUsers()
      closeModal()
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (user: UserType) => {
    setCurrentUser(user)
    setIsDeleteModalOpen(true)
  }

  // Delete the user
  const confirmDeleteUser = async () => {
    if (!currentUser?.id) return
    
    try {
      await deleteUser(currentUser.id)
      await fetchUsers()
      closeModal()
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 title-3d">Manage Users</h1>
        <NeumorphicButton className="w-full sm:w-auto" onClick={() => openUserModal()}>
          <Plus className="w-4 h-4 mr-2" />
          <span>Add User</span>
        </NeumorphicButton>
      </div>

      <GlassmorphicCard className="p-4 md:p-6 border border-blue-100/50 dark:border-blue-800/30" borderGlow={true}>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <NeumorphicInput 
              placeholder="Search users..." 
              icon={<Search className="h-4 w-4" />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <NeumorphicButton variant="outline" className="w-full justify-between">
              <span>Filter</span>
              <Filter className="w-4 h-4" />
            </NeumorphicButton>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full py-8 text-center text-gray-500">
                No users found. Add your first user!
              </div>
            ) : (
              filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <GlassmorphicCard 
                    className="p-6 border border-blue-100/50 dark:border-blue-800/30 transition-all hover:shadow-lg"
                    borderGlow={true}
                    animateHover={true}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gradient-to-r from-blue-400 to-indigo-500 p-0.5">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                          <UserAvatar
                            src={user.avatar}
                            alt={user.name}
                            size={48}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">{user.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between p-2 rounded-lg bg-gray-50/70 dark:bg-gray-800/30">
                        <span className="text-gray-600 dark:text-gray-400">Role</span>
                        <span className={user.role === 'admin' ? 'text-purple-600 dark:text-purple-400 font-medium' : ''}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-blue-50/70 dark:bg-blue-900/10">
                        <span className="text-gray-600 dark:text-gray-400">Events</span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                          {user.events.length}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <NeumorphicButton 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => openUserModal(user)}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </NeumorphicButton>
                      {user.email !== 'admin@event.ae' && (
                        <NeumorphicButton 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => openDeleteModal(user)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </NeumorphicButton>
                      )}
                    </div>
                  </GlassmorphicCard>
                </motion.div>
              ))
            )}
          </div>
        )}
      </GlassmorphicCard>

      {/* User Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto styled-scrollbar"
          >
            <GlassmorphicCard className="p-6 border border-blue-100/50 dark:border-blue-800/30" borderGlow={true}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                  {currentUser?.id ? 'Edit User' : 'Add User'}
                </h2>
                <button onClick={closeModal} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-indigo-500 p-0.5 mb-4 relative">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                      {imagePreview && (
                        <Image
                          src={imagePreview}
                          alt="User preview"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <button 
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <NeumorphicInput 
                      name="name" 
                      value={currentUser?.name || ''}
                      onChange={handleInputChange}
                      placeholder="Full name" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <NeumorphicInput 
                      name="email" 
                      type="email"
                      value={currentUser?.email || ''}
                      onChange={handleInputChange}
                      placeholder="user@example.com" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <NeumorphicInput 
                      name="password" 
                      type="password"
                      value={currentUser?.password || ''}
                      onChange={handleInputChange}
                      placeholder={currentUser?.id ? "••••••••" : "Create password"} 
                    />
                    {currentUser?.id && (
                      <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      name="role"
                      value={currentUser?.role || 'user'}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      disabled={currentUser?.email === 'admin@event.ae'}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <NeumorphicButton variant="outline" onClick={closeModal}>Cancel</NeumorphicButton>
                <NeumorphicButton onClick={saveUser}>
                  <Check className="w-4 h-4 mr-2" />
                  {currentUser?.id ? 'Update User' : 'Add User'}
                </NeumorphicButton>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <GlassmorphicCard className="p-6 border border-red-100/50 dark:border-red-800/30" borderGlow={true}>
              <div className="flex items-center justify-center mb-4 text-red-500">
                <Trash2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-center mb-4">Delete User</h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{currentUser?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <NeumorphicButton variant="outline" onClick={closeModal}>Cancel</NeumorphicButton>
                <NeumorphicButton className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDeleteUser}>
                  Delete
                </NeumorphicButton>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}