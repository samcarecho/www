(function(angular, undefined) {
	 angular.module("atadosConstants", [])

.constant("ENV", "production")

.constant("api", "https://api.atados.com.br/v1/")

.constant("authApi", "https://www.atados.com.br/auth/client")

.constant("storage", "https://s3-sa-east-1.amazonaws.com/atadosapp/images/")

.constant("selected", "https://s3-sa-east-1.amazonaws.com/atadosapp/images/heart.png")

.constant("notselected", "https://s3-sa-east-1.amazonaws.com/atadosapp/images/blue.png")

.constant("facebookClientId", "430973993601792")

.constant("locale", "pt_BR")

.constant("accessTokenCookie", "access_token")

.constant("csrfCookie", "csrftoken")

.constant("sessionIdCookie", "sessionid")

.constant("grantType", "password")

.constant("page_size", 30)

.constant("active_cities", 4)

.constant("static_page_size", 300)

.constant("weekdays", [
  {
    "1": "Segunda"
  },
  {
    "2": "Terça"
  },
  {
    "3": "Quarta"
  },
  {
    "4": "Quinta"
  },
  {
    "5": "Sexta"
  },
  {
    "6": "Sabado"
  },
  {
    "7": "Domingo"
  }
])

.constant("periods", [
  {
    "0": "Manha"
  },
  {
    "1": "Tarde"
  },
  {
    "2": "Noite"
  }
])

.constant("defaultZoom", 11)

.constant("VOLUNTEER", "VOLUNTEER")

.constant("NONPROFIT", "NONPROFIT")

; 
})(angular);