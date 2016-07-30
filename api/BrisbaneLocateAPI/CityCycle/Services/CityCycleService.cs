using CityCycle.Interfaces;
using CityCycle.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Serialization;

namespace CityCycle.Services
{
    public class CityCycleService : ICityCycleService
    {
        public CityCycleService()
        {

        }

        public IList<CityCycleStation> GetStations()
        {
            CityCycle.Models.Xml.Carto cityCycleLocations;

            using (var webClient = new System.Net.WebClient())
            {
                var cityCycleLocationsXMLString = webClient.DownloadString("http://www.citycycle.com.au/service/carto");
                XmlSerializer serializer = new XmlSerializer(typeof(CityCycle.Models.Xml.Carto));
                MemoryStream memStream = new MemoryStream(Encoding.UTF8.GetBytes(cityCycleLocationsXMLString));
                cityCycleLocations = (CityCycle.Models.Xml.Carto)serializer.Deserialize(memStream);
            }
                
            return cityCycleLocations.Markers.Marker.Select(x => new CityCycleStation() {
                Id = x.Number,
                Name = x.Name,
                Address = x.Address,
                FullAddress = x.FullAddress,
                Latitude = x.Lat,
                Longitude = x.Lng,
                Open = x.Open
            }).ToList();
        }
    }
}
