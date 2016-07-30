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

namespace RSSFeeds.Services
{
    public class FitnessEventService
    {
        public List<TrumbaEvent> GetFitnessEvents()
        {
            return TrumbaService.GetEvents("http://www.trumba.com/calendars/type.rss?filterview=Fitness&mixin=688783%2c681701%2c782935%2c812762");
        }
    }

    public class KidsEventService
    {
        public List<TrumbaEvent> GetKidsEvents()
        {
            return TrumbaService.GetEvents("http://www.trumba.com/calendars/brisbane-kids.rss?filterview=kids_6_12");
        }
    }

    public class CouncilEventService
    {
        public List<TrumbaEvent> GetCouncilEvents()
        {
            return TrumbaService.GetEvents("http://www.trumba.com/calendars/brisbane-city-council.rss");
        }
    }

    public class ActiveParksService
    {
        public List<TrumbaEvent> GetActiveParksEvents()
        {
            return TrumbaService.GetEvents("http://www.trumba.com/calendars/active-parks.rss");
        }
    }

    class TrumbaService
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
    }
}
