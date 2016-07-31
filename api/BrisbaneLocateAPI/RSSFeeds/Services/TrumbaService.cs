using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using RSSFeeds.Models;
using RSSFeeds.Models.XML;

using System.Net;
using System.Xml.Serialization;
using System.IO;
using RSSFeeds.Models.JSON;
using Newtonsoft.Json;

namespace RSSFeeds.Services
{
    public class FitnessEventService
    {
        static public List<TrumbaEvent> FitnessEvents { get; private set; }
        static private DateTime LastUpdated { get; set; }
        
        public List<TrumbaEvent> GetEvents()
        {
            if (FitnessEvents == null || DateTime.Now.Subtract(LastUpdated).TotalDays > 1)
            {
                FitnessEvents = TrumbaService.GetEvents("http://www.trumba.com/calendars/type.rss?filterview=Fitness&mixin=688783%2c681701%2c782935%2c812762");
                FitnessEvents = TrumbaService.ComputeGeocodes(FitnessEvents);
                LastUpdated = DateTime.Now;
            }

            return FitnessEvents;
        }   
    }

    public class KidsEventService
    {
        static public List<TrumbaEvent> KidsEvents { get; private set; }
        static private DateTime LastUpdated { get; set; }

        public List<TrumbaEvent> GetEvents()
        {
            if (KidsEvents == null || DateTime.Now.Subtract(LastUpdated).TotalDays > 1)
            {
                KidsEvents = TrumbaService.GetEvents("http://www.trumba.com/calendars/brisbane-kids.rss?filterview=kids_6_12");
                KidsEvents = TrumbaService.ComputeGeocodes(KidsEvents);
                LastUpdated = DateTime.Now;
            }

            return KidsEvents;
        }
    }

    public class CouncilEventService
    {
        static public List<TrumbaEvent> CouncilEvents { get; private set; }
        static private DateTime LastUpdated { get; set; }

        public List<TrumbaEvent> GetEvents()
        {
            if (CouncilEvents == null || DateTime.Now.Subtract(LastUpdated).TotalDays > 1)
            {
                CouncilEvents = TrumbaService.GetEvents("http://www.trumba.com/calendars/brisbane-city-council.rss");
                CouncilEvents = TrumbaService.ComputeGeocodes(CouncilEvents);
                LastUpdated = DateTime.Now;
            }

            return CouncilEvents;
        }
    }

    public class ActiveParksService
    {
        static public List<TrumbaEvent> ActiveParks { get; private set; }
        static private DateTime LastUpdated { get; set; }

        public List<TrumbaEvent> GetEvents()
        {
            if (ActiveParks == null || DateTime.Now.Subtract(LastUpdated).TotalDays > 1)
            {
                ActiveParks = TrumbaService.GetEvents("http://www.trumba.com/calendars/active-parks.rss");
                ActiveParks = TrumbaService.ComputeGeocodes(ActiveParks);
                LastUpdated = DateTime.Now;
            }

            return ActiveParks;
        }
    }

    public class TrumbaService
    {
        public static List<TrumbaEvent> GetEvents(string queryUrl)
        {
            var strResult = new WebClient().DownloadString(queryUrl);
            XmlSerializer serializer = new XmlSerializer(typeof(TrumbaXML));

            TrumbaXML fitnessEvents = (TrumbaXML)serializer.Deserialize(new MemoryStream(Encoding.UTF8.GetBytes(strResult)));

            return fitnessEvents.Channel.Item.Select(x => new TrumbaEvent()
            {
                Title = x.Title,
                Description = x.Description[0],
                StartTime = DateTime.Parse(x.Dtstart),
                EndTime = DateTime.Parse(x.Dtend),
                Link = x.Link,
                EventActionLink = x.Ealink,
                Cost = (x.Customfield.FirstOrDefault(y => y.Name == "Cost") ?? new Customfield() { Text = "" }).Text, //Terrible terrible hacks
                Address = (x.Customfield.FirstOrDefault(y => y.Name == "Venue address") ?? new Customfield() { Text = "" }).Text,
                AgeRestriction = (x.Customfield.FirstOrDefault(y => y.Name == "Age") ?? new Customfield() { Text = "" }).Text,
                Requirements = (x.Customfield.FirstOrDefault(y => y.Name == "Requirements") ?? new Customfield() { Text = "" }).Text
            }).ToList();
        }

        public static List<TrumbaEvent> ComputeGeocodes(List<TrumbaEvent> events)
        {
            var geocodedEvents = new List<TrumbaEvent>();

            foreach (var tEvent in events)
            {
                var geocodedLocationJsonString = new WebClient().DownloadString(string.Format("https://maps.googleapis.com/maps/api/geocode/json?address={0}, Australia&key=AIzaSyBpNUYHooprLMjukZc2O4n-VBtwUB_X6js", tEvent.Address));
                Geocode geocodedLocation = JsonConvert.DeserializeObject<Geocode>(geocodedLocationJsonString);

                if (geocodedLocation.results.Count > 0)
                {
                    tEvent.Latitude = (decimal)(geocodedLocation.results[0].geometry.location.lat);
                    tEvent.Longitude = (decimal)(geocodedLocation.results[0].geometry.location.lng);

                    geocodedEvents.Add(tEvent);
                }
            }

            return geocodedEvents;
        }

        /*
         * I HAVE SEEN THE DEVILS FACE AND I HAVE LIVED 
         */
        public static List<TrumbaEvent> FilterEventsByDistance(double latitude, double longitude, List<TrumbaEvent> events, double maxDistanceInKilometers)
        {
            var nearbyEvents = new List<TrumbaEvent>();

            foreach (var tEvent in events)
            {
                var EarthsRadius = 6371; // km
                var LatitudeDifference = (latitude - (double)tEvent.Latitude) * (Math.PI / 180);
                var LongitudeDifference = (longitude - (double)tEvent.Longitude) * (Math.PI / 180);
                var EventLatitude = ((double)tEvent.Latitude) * (Math.PI / 180);
                var Latitude = latitude * (Math.PI / 180);

                var Angle = Math.Sin(LatitudeDifference / 2) * Math.Sin(LatitudeDifference / 2) +
                            Math.Sin(LongitudeDifference / 2) * Math.Sin(LongitudeDifference / 2) * 
                            Math.Cos(EventLatitude) * Math.Cos(Latitude);

                var Distance = EarthsRadius * (2 * Math.Atan2(Math.Sqrt(Angle), Math.Sqrt(1 - Angle)));

                if (Distance <= maxDistanceInKilometers)
                {
                    nearbyEvents.Add(tEvent);
                }   
            }

            return nearbyEvents;
        }

        public static List<TrumbaEvent> FilterEventsByDistanceAndDate(double latitude, double longitude, DateTime date, List<TrumbaEvent> events, double maxDistanceInKilometers)
        {
            events = FilterEventsByDistance(latitude, longitude, events, maxDistanceInKilometers);
            events = events.Where(x => x.StartTime.Date == date.Date).ToList();

            return events;
        }
    }
}
