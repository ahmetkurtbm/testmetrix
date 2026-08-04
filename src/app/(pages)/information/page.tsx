import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Users, Target, Mail } from "lucide-react";
import Link from "next/link";

export default function InformationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-gray-800">
              Eğitimde Yenilikçi Çözümler
            </h1>
            <p className="text-base text-gray-600">
              Öğretmenler için özel olarak tasarlanmış, veri odaklı eğitim
              yönetim platformu
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Book className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Kolay Veri Yönetimi
                </h2>
                <p className="text-gray-600">
                  Excel dosyalarınızı kolayca yükleyin, düzenleyin ve analiz
                  edin. Öğrenci verilerini tek bir platformda yönetin.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Detaylı Analizler
                </h2>
                <p className="text-gray-600">
                  Öğrenci performansını grafikler ve raporlarla takip edin. Veri
                  odaklı kararlar alın.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  İşbirliği ve Paylaşım
                </h2>
                <p className="text-gray-600">
                  Meslektaşlarınızla verilerinizi güvenle paylaşın. Okul
                  genelinde koordinasyonu artırın.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/90 backdrop-blur">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Destek ve İletişim
                </h2>
                <p className="text-gray-600">
                  7/24 teknik destek ve eğitim desteği. Sorularınız için her
                  zaman yanınızdayız.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-5 bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800">Hemen Başlayın</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Eğitim süreçlerinizi dijitalleştirin, veri odaklı kararlar alın ve
              öğrencilerinizin başarısını artırın.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/excel-upload">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
                  Hemen Başla
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/iletisim">
                <Button variant="outline" className="px-8 py-2">
                  İletişime Geç
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
