
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, RefreshCw, Trash, Edit, Plus, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Client = {
  id: string;
  name: string;
  username: string;
  webhook_url: string;
  created_at: string;
};

type EditingClient = {
  id: string | null;
  name: string;
  username: string;
  password: string;
  webhook_url: string;
};

export default function Admin() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const [editingClient, setEditingClient] = useState<EditingClient>({
    id: null,
    name: "",
    username: "",
    password: "",
    webhook_url: "",
  });

  const clearEditingClient = () => {
    setEditingClient({
      id: null,
      name: "",
      username: "",
      password: "",
      webhook_url: "",
    });
  };

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin', {
        body: { action: 'listClients' }
      });
      
      if (error) throw error;
      if (data.success && data.clients) {
        setClients(data.clients);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch clients");
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClient.name || !editingClient.username || !editingClient.password || !editingClient.webhook_url) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin', {
        body: {
          action: 'createClient',
          clientData: {
            name: editingClient.name,
            username: editingClient.username,
            password: editingClient.password,
            webhook_url: editingClient.webhook_url
          }
        }
      });
      
      if (error) throw error;
      if (data.success) {
        toast.success("Client created successfully");
        fetchClients();
        setIsAdding(false);
        clearEditingClient();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create client");
      console.error("Error creating client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClient.name || !editingClient.webhook_url) {
      toast.error("Name and webhook URL are required");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin', {
        body: {
          action: 'updateClient',
          clientData: {
            id: editingClient.id,
            name: editingClient.name,
            webhook_url: editingClient.webhook_url
          }
        }
      });
      
      if (error) throw error;
      if (data.success) {
        toast.success("Client updated successfully");
        fetchClients();
        setIsEditing(null);
        clearEditingClient();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update client");
      console.error("Error updating client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (id: string, username: string) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin', {
        body: {
          action: 'deleteClient',
          clientData: {
            id,
            username
          }
        }
      });
      
      if (error) throw error;
      if (data.success) {
        toast.success("Client deleted successfully");
        fetchClients();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete client");
      console.error("Error deleting client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (client: Client) => {
    setEditingClient({
      id: client.id,
      name: client.name,
      username: client.username,
      password: "",
      webhook_url: client.webhook_url
    });
    setIsEditing(client.id);
    setIsAdding(false);
  };

  const startAdding = () => {
    clearEditingClient();
    setIsAdding(true);
    setIsEditing(null);
  };

  const cancelAction = () => {
    setIsAdding(false);
    setIsEditing(null);
    clearEditingClient();
  };

  return (
    <motion.div 
      className="container py-8 bg-gradient-to-br from-slate-900 to-slate-950 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-blue-300">Manage SEO Engine AI Bot clients</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchClients} 
            disabled={isLoading}
            className="text-blue-300 hover:text-white"
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut} 
            className="text-slate-300 hover:text-white hover:bg-blue-700"
          >
            <LogOut size={16} className="mr-1" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white">Clients</h2>
          <Button 
            onClick={startAdding} 
            disabled={isAdding || isEditing !== null}
            size="sm" 
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Plus size={16} className="mr-1" />
            Add Client
          </Button>
        </div>

        {isAdding && (
          <motion.div
            className="mb-6 p-4 border border-blue-500/30 rounded-lg bg-slate-850"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-white text-lg mb-3">Add New Client</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-blue-100">Name</Label>
                  <Input
                    id="name"
                    placeholder="Client Name"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-blue-100">Username</Label>
                  <Input
                    id="username"
                    placeholder="client_username"
                    value={editingClient.username}
                    onChange={(e) => setEditingClient({...editingClient, username: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-100">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={editingClient.password}
                    onChange={(e) => setEditingClient({...editingClient, password: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook" className="text-blue-100">Webhook URL</Label>
                  <Input
                    id="webhook"
                    placeholder="https://example.com/webhook"
                    value={editingClient.webhook_url}
                    onChange={(e) => setEditingClient({...editingClient, webhook_url: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelAction}
                  className="border-blue-500/30 text-blue-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  {isLoading ? 'Creating...' : 'Create Client'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
        
        {clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-slate-300 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Webhook URL</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {clients.map((client) => (
                  <React.Fragment key={client.id}>
                    <tr className="hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-white">{client.name}</td>
                      <td className="px-4 py-3 text-blue-300">{client.username}</td>
                      <td className="px-4 py-3 text-slate-300 truncate max-w-[200px]">
                        {client.webhook_url}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {new Date(client.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing === client.id ? (
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelAction}
                              className="border-blue-500/30 text-blue-300 hover:text-white h-8 w-8 p-0"
                            >
                              ✕
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleUpdateClient} 
                              disabled={isLoading}
                              className="bg-blue-600 hover:bg-blue-500 h-8 w-8 p-0"
                            >
                              <Save size={16} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => startEditing(client)}
                              disabled={isAdding || isEditing !== null}
                              className="border-blue-500/30 text-blue-300 hover:text-white h-8 w-8 p-0"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteClient(client.id, client.username)}
                              disabled={isLoading}
                              className="border-red-500/30 text-red-400 hover:text-white hover:bg-red-900/50 h-8 w-8 p-0"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {isEditing === client.id && (
                      <tr>
                        <td colSpan={5} className="bg-slate-800">
                          <motion.div
                            className="p-4 border-t border-blue-500/30"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <form onSubmit={handleUpdateClient} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name" className="text-blue-100">Name</Label>
                                  <Input
                                    id="edit-name"
                                    placeholder="Client Name"
                                    value={editingClient.name}
                                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-webhook" className="text-blue-100">Webhook URL</Label>
                                  <Input
                                    id="edit-webhook"
                                    placeholder="https://example.com/webhook"
                                    value={editingClient.webhook_url}
                                    onChange={(e) => setEditingClient({...editingClient, webhook_url: e.target.value})}
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={cancelAction}
                                  className="border-blue-500/30 text-blue-300 hover:text-white"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit"
                                  disabled={isLoading}
                                  className="bg-blue-600 hover:bg-blue-500"
                                >
                                  {isLoading ? 'Updating...' : 'Update Client'}
                                </Button>
                              </div>
                            </form>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-2"></div>
            <p className="text-blue-300">Loading clients...</p>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-slate-400 mb-2">No clients found</p>
            <Button 
              onClick={startAdding} 
              variant="outline"
              className="border-blue-500/30 text-blue-300 hover:text-white"
            >
              <Plus size={16} className="mr-1" />
              Add Your First Client
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
