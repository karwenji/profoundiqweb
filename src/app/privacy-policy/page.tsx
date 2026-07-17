'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-blue-100">
              Your privacy is important to us. Learn how we protect and use your information.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardContent className="pt-8 pb-8">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Our website privacy policies and conditions of use are as stipulated below.
                  By accessing this site, you are agreeing to be bound by these terms.
                </p>
                <p className="text-sm text-gray-500">
                  Last updated: July 2026
                </p>
              </CardContent>
            </Card>

            {/* Section 1: Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing this web site, you are agreeing to be bound by these web site Terms
                and Conditions of Use, applicable laws and regulations and their compliance. If
                you disagree with any of the stated terms and conditions, you are prohibited
                from using or accessing this site. The materials contained in this site are
                secured by relevant copyright and trade mark law.
              </p>
            </div>

            {/* Section 2: Use License */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                Use License
              </h2>
              <ol className="list-decimal list-inside space-y-4 text-gray-700 leading-relaxed ml-4">
                <li>
                  Permission is allowed to temporarily download one duplicate of the materials
                  (data or programming) on this site for individual and non-business use only. This
                  is just a permit of license and not an exchange of title, and under this
                  permit you may not:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-600">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial use, or for any public presentation</li>
                    <li>Attempt to decompile or rebuild any product or material contained on this site</li>
                    <li>Remove any copyright or other restrictive documentations from the materials</li>
                    <li>Transfer the materials to someone else or "mirror" the materials on other servers</li>
                  </ul>
                </li>
                <li>
                  This permit might consequently be terminated if you disregard any of these
                  confinements and may be ended by Profound IQ Consulting whenever deemed. After permit
                  termination or when your viewing permit is terminated, you must destroy any
                  downloaded materials in your ownership whether in electronic or printed form.
                </li>
              </ol>
            </div>

            {/* Section 3: Disclaimer */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                Disclaimer
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The materials on Profound IQ Consulting site are given "as is". Profound IQ
                Consulting makes no guarantees, communicated or suggested, and thus renounces and
                nullifies every single other warranties, including without impediment, inferred
                guarantees or states of merchantability, fitness for a specific reason, or
                non-encroachment of licensed property or other infringement of rights. Further,
                Profound IQ Consulting does not warrant or make any representations concerning the
                precision, likely results, or unwavering quality of the utilization of the materials
                on its Internet site or generally identifying with such materials or on any
                destinations connected to this website.
              </p>
            </div>

            {/* Section 4: Constraints */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
                Constraints
              </h2>
              <p className="text-gray-700 leading-relaxed">
                In no occasion should Profound IQ Consulting or its suppliers subject for any
                harms (counting, without constraint, harms for loss of information or benefit, or
                because of business interference) emerging out of the utilization or
                powerlessness to utilize the materials on Profound IQ Consulting's Internet webpage,
                regardless of the possibility that Profound IQ Consulting or a
                Profound IQ Consulting approved agent has been told orally or in written of the
                likelihood of such harm. Since a few purviews don't permit constraints on
                inferred guarantees, or impediments of obligation for weighty or coincidental harms,
                these confinements may not make a difference to you.
              </p>
            </div>

            {/* Section 5: Amendments */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">5</span>
                Amendments and Errata
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The materials showing up on Profound IQ Consulting's site could incorporate
                typographical, or photographic mistakes. Profound IQ Consulting does not warrant
                that any of the materials on its site are exact, finished, or current. Profound IQ
                Consulting may roll out improvements to the materials contained on its site
                whenever without notification. Profound IQ Consulting does not, then again, make
                any dedication to update the materials.
              </p>
            </div>

            {/* Section 6: Links */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">6</span>
                Links
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Profound IQ Consulting has not checked on the majority of the websites or
                links connected to its website and is not in charge of the substance of any such
                connected webpage. The incorporation of any connection does not infer support by
                Profound IQ Consulting of the site. Utilization of any such connected site is at
                the user's own risk.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our website may contain links to external sites that are not maintained by us.
                We have no control over the content and practices of these sites and cannot
                accept responsibility for their respective privacy policies.
              </p>
            </div>

            {/* Section 7: Analytics */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">7</span>
                Analytics and Advertising
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may use third-party service providers to monitor and analyze the use of our
                website and to serve advertisements to you. These third parties may use cookies
                and similar tracking technologies to collect information about your interactions
                with our website and other sites.
              </p>
            </div>

            {/* Section 8: Modifications */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">8</span>
                Site Terms of Use Modifications
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Profound IQ Consulting may update these terms of utilization for its website
                whenever without notification. By utilizing this site you are consenting to be
                bound by the then current form of these Terms and Conditions of Use.
              </p>
            </div>

            {/* Section 9: Governing Law */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">9</span>
                Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Any case identifying with Profound IQ Consulting's site should be administered
                by the corporate laws of Kenya without respect to its contention of law
                provisions, General Terms and Conditions applicable to Use of a Web Site.
              </p>
            </div>

            {/* Section 10: Privacy Policy Details */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">10</span>
                Privacy Policy Details
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Your privacy is critical to us. Likewise, we have built up this Policy with the
                end goal you should see how we gather, utilize, impart and disclose and make
                utilization of individual data. The following outlines our privacy policy:
              </p>
              <ul className="space-y-3 text-gray-700 leading-relaxed ml-4">
                <li className="flex items-start">
                  <Lock className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>Before or at the time of collecting personal information, we will identify the purposes for which information is being collected.</span>
                </li>
                <li className="flex items-start">
                  <Lock className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>We will gather and utilization of individual data singularly with the target of satisfying those reasons indicated by us and for other good purposes, unless we get the assent of the individual concerned or as required by law.</span>
                </li>
                <li className="flex items-start">
                  <Lock className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>We will just hold individual data the length of essential for the satisfaction of those reasons.</span>
                </li>
                <li className="flex items-start">
                  <Lock className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>We will gather individual data by legal and reasonable means and, where fitting, with the information or assent of the individual concerned.</span>
                </li>
                <li className="flex items-start">
                  <Eye className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>Personal information ought to be important to the reasons for which it is to be utilized, and, to the degree essential for those reasons, ought to be exact, finished, and updated.</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>We will protect individual data by security shields against misfortune or burglary, and also unapproved access, divulgence, duplicating, use or alteration.</span>
                </li>
                <li className="flex items-start">
                  <FileText className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>We will promptly provide customers with access to our policies and procedures for the administration of individual data.</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>We are focused on leading our business as per these standards with a specific end goal to guarantee that the privacy of individual data is secure and maintained.</span>
                </li>
              </ul>
            </div>

            {/* Back Link */}
            <div className="mt-12 pt-8 border-t">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
