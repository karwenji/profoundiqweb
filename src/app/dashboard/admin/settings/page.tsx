import { redirect } from 'next/navigation'

export default function AdminSettingsPage() {
  redirect('/dashboard/admin/settings/general')
}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Allow Instructor Registration</h4>
                  <p className="text-sm text-gray-600">Enable new instructors to sign up</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowInstructorRegistration}
                  onChange={(e) => setSettings({ ...settings, allowInstructorRegistration: e.target.checked })}
                  className="h-5 w-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Auto-Approve Courses</h4>
                  <p className="text-sm text-gray-600">Automatically publish new courses</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoApproveCourses}
                  onChange={(e) => setSettings({ ...settings, autoApproveCourses: e.target.checked })}
                  className="h-5 w-5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notification Email</label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
            </div>

            {/* Payment Methods Configuration */}
            <div ref={paymentRef} id="payment-settings">
              <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </h3>
                <p className="text-sm text-gray-600">Configure payment gateways for course purchases</p>
              </div>
              <Button
                onClick={() => {
                  const newMethod: PaymentMethod = {
                    id: Date.now().toString(),
                    name: '',
                    type: 'paystack',
                    enabled: false,
                  }
                  setPaymentMethods([...paymentMethods, newMethod])
                }}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Method
              </Button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Payment Method Name</label>
                        <input
                          type="text"
                          value={method.name}
                          onChange={(e) => {
                            setPaymentMethods(
                              paymentMethods.map((m) =>
                                m.id === method.id ? { ...m, name: e.target.value } : m
                              )
                            )
                          }}
                          placeholder="e.g., Paystack, Stripe"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Gateway Type</label>
                        <select
                          value={method.type}
                          onChange={(e) => {
                            setPaymentMethods(
                              paymentMethods.map((m) =>
                                m.id === method.id
                                  ? { ...m, type: e.target.value as PaymentMethod['type'] }
                                  : m
                              )
                            )
                          }}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="paystack">Paystack</option>
                          <option value="stripe">Stripe</option>
                          <option value="paypal">PayPal</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>

                      {method.type !== 'bank_transfer' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1">Public Key / Client ID</label>
                            <input
                              type="text"
                              value={method.publicKey || ''}
                              onChange={(e) => {
                                setPaymentMethods(
                                  paymentMethods.map((m) =>
                                    m.id === method.id ? { ...m, publicKey: e.target.value } : m
                                  )
                                )
                              }}
                              placeholder="Enter public key or client ID"
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Secret Key</label>
                            <input
                              type="password"
                              value={method.secretKey || ''}
                              onChange={(e) => {
                                setPaymentMethods(
                                  paymentMethods.map((m) =>
                                    m.id === method.id ? { ...m, secretKey: e.target.value } : m
                                  )
                                )
                              }}
                              placeholder="Enter secret key"
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Currency</label>
                            <input
                              type="text"
                              value={method.currency || ''}
                              onChange={(e) => {
                                setPaymentMethods(
                                  paymentMethods.map((m) =>
                                    m.id === method.id ? { ...m, currency: e.target.value } : m
                                  )
                                )
                              }}
                              placeholder="e.g., NGN, USD, EUR"
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </>
                      )}

                      {method.type === 'bank_transfer' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Account Details</label>
                          <textarea
                            value={method.accountDetails || ''}
                            onChange={(e) => {
                              setPaymentMethods(
                                paymentMethods.map((m) =>
                                  m.id === method.id ? { ...m, accountDetails: e.target.value } : m
                                )
                              )
                            }}
                            placeholder="Enter bank name, account number, etc."
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Enabled</label>
                        <input
                          type="checkbox"
                          checked={method.enabled}
                          onChange={(e) => {
                            setPaymentMethods(
                              paymentMethods.map((m) =>
                                m.id === method.id ? { ...m, enabled: e.target.checked } : m
                              )
                            )
                          }}
                          className="h-5 w-5"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setPaymentMethods(paymentMethods.filter((m) => m.id !== method.id))
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {paymentMethods.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payment methods configured yet</p>
                </div>
              )}
            </div>

              <Button onClick={handleSave} className="w-full mt-6">
                <Save className="mr-2 h-4 w-4" /> Save Payment Settings
              </Button>
            </CardContent>
          </Card>
            </div>

            {/* Webhook & Callback Configuration */}
            <div ref={webhookRef} id="webhook-settings">
              <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook & Callback Configuration
              </h3>
              <p className="text-sm text-gray-600">Configure URLs for instant payment processing and notifications</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Callback URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookSettings.callbackUrl}
                    onChange={(e) => setWebhookSettings({ ...webhookSettings, callbackUrl: e.target.value })}
                    placeholder="https://yourdomain.com/api/payment/callback"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(webhookSettings.callbackUrl, 'callback')}
                  >
                    {copiedField === 'callback' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  URL where users are redirected after payment completion
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Webhook URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookSettings.webhookUrl}
                    onChange={(e) => setWebhookSettings({ ...webhookSettings, webhookUrl: e.target.value })}
                    placeholder="https://yourdomain.com/api/payment/webhook"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(webhookSettings.webhookUrl, 'webhook')}
                  >
                    {copiedField === 'webhook' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  URL that receives payment status updates from payment gateways
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Webhook Secret Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={webhookSettings.webhookSecret}
                    onChange={(e) => setWebhookSettings({ ...webhookSettings, webhookSecret: e.target.value })}
                    placeholder="Webhook secret for signature verification"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button variant="outline" size="sm" onClick={generateWebhookSecret}>
                    Generate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(webhookSettings.webhookSecret, 'secret')}
                  >
                    {copiedField === 'secret' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Secret key used to verify webhook signatures from payment providers
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-sm">Instant Processing Options</h4>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h5 className="font-medium text-sm">Enable Instant Processing</h5>
                    <p className="text-xs text-gray-600">Process payments immediately upon webhook confirmation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={webhookSettings.enableInstantProcessing}
                    onChange={(e) => setWebhookSettings({ ...webhookSettings, enableInstantProcessing: e.target.checked })}
                    className="h-5 w-5"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h5 className="font-medium text-sm">Auto-Enroll on Success</h5>
                    <p className="text-xs text-gray-600">Automatically enroll students after successful payment</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={webhookSettings.autoEnrollOnSuccess}
                    onChange={(e) => setWebhookSettings({ ...webhookSettings, autoEnrollOnSuccess: e.target.checked })}
                    className="h-5 w-5"
                  />
                </div>
              </div>
            </div>

              <Button onClick={handleSave} className="w-full mt-6">
                <Save className="mr-2 h-4 w-4" /> Save Webhook Settings
              </Button>
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminSettingsPageWrapper() {
  return (
    <ProtectedRoute>
      <AdminSettingsPage />
    </ProtectedRoute>
  )
}
