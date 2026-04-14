import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Address } from '../types';
import { User, Package, MapPin } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'España',
    isDefault: false,
  });

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (user) {
      updateUser({
        ...user,
        name,
        email,
      });
      toast.success('Perfil actualizado exitosamente');
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Por favor completa todos los campos de dirección');
      return;
    }

    if (user) {
      const addressWithId: Address = {
        ...newAddress,
        id: `addr_${Date.now()}`,
      };

      // Si es la primera dirección o está marcada como predeterminada
      const updatedAddresses = newAddress.isDefault
        ? [...user.addresses.map(a => ({ ...a, isDefault: false })), addressWithId]
        : [...user.addresses, addressWithId];

      updateUser({
        ...user,
        addresses: updatedAddresses,
      });

      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'España',
        isDefault: false,
      });

      toast.success('Dirección agregada exitosamente');
    }
  };

  const handleRemoveAddress = (addressId: string) => {
    if (user) {
      updateUser({
        ...user,
        addresses: user.addresses.filter(a => a.id !== addressId),
      });
      toast.success('Dirección eliminada');
    }
  };

  const handleSetDefaultAddress = (addressId: string) => {
    if (user) {
      updateUser({
        ...user,
        addresses: user.addresses.map(a => ({
          ...a,
          isDefault: a.id === addressId,
        })),
      });
      toast.success('Dirección predeterminada actualizada');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl mb-8">Mi Perfil</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menú lateral */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {}}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Información Personal
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate('/mis-pedidos')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Mis Pedidos
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Direcciones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Información Personal</TabsTrigger>
                <TabsTrigger value="addresses">Direcciones</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Rol</Label>
                        <Input
                          value={user.role === 'administrador' ? 'Administrador' : 'Cliente'}
                          disabled
                        />
                      </div>
                      <Button type="submit">
                        Guardar Cambios
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses">
                <div className="space-y-6">
                  {/* Direcciones existentes */}
                  {user.addresses.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Direcciones Guardadas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {user.addresses.map((address) => (
                          <div
                            key={address.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p>{address.street}</p>
                                <p>{address.city}, {address.state}</p>
                                <p>{address.zipCode}, {address.country}</p>
                              </div>
                              {address.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 mt-3">
                              {!address.isDefault && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                >
                                  Hacer Predeterminada
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveAddress(address.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Nueva dirección */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Agregar Nueva Dirección</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div>
                          <Label htmlFor="new-street">Dirección</Label>
                          <Input
                            id="new-street"
                            value={newAddress.street}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, street: e.target.value })
                            }
                            placeholder="Calle y número"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-city">Ciudad</Label>
                            <Input
                              id="new-city"
                              value={newAddress.city}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, city: e.target.value })
                              }
                              placeholder="Ciudad"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-state">Provincia</Label>
                            <Input
                              id="new-state"
                              value={newAddress.state}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, state: e.target.value })
                              }
                              placeholder="Provincia"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-zipCode">Código Postal</Label>
                            <Input
                              id="new-zipCode"
                              value={newAddress.zipCode}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, zipCode: e.target.value })
                              }
                              placeholder="28001"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-country">País</Label>
                            <Input
                              id="new-country"
                              value={newAddress.country}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, country: e.target.value })
                              }
                              placeholder="España"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="new-default"
                            checked={newAddress.isDefault}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, isDefault: e.target.checked })
                            }
                          />
                          <Label htmlFor="new-default" className="cursor-pointer">
                            Establecer como dirección predeterminada
                          </Label>
                        </div>
                        <Button type="submit">
                          Agregar Dirección
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
