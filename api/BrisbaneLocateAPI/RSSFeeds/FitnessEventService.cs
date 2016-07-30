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

namespace RSSFeeds
{
    public class FitnessEventService
    {
        public FitnessEvents GetFitnessEvents()
        {
            var strResult = new WebClient().DownloadString("http://www.trumba.com/calendars/type.rss?filterview=Fitness&mixin=688783%2c681701%2c782935%2c812762");
            XmlSerializer serializer = new XmlSerializer(typeof(FitnessEventsXML));

            FitnessEventsXML fitnessEvents = (FitnessEventsXML)serializer.Deserialize(new MemoryStream(Encoding.UTF8.GetBytes(strResult)));

            return new FitnessEvents()
            {
                Items = fitnessEvents.Channel.Item.Select(x => new FitnessItem()
                {
                    Title = x.Title,
                    Description = x.Description[0],
                    Link = x.Link,
                    EventActionLink = x.Ealink,
                    Cost = (x.Customfield.FirstOrDefault(y => y.Name == "Cost") ?? new Customfield() { Text = "" }).Text, //Terrible terrible hacks
                    Address = (x.Customfield.FirstOrDefault(y => y.Name == "Venue address") ?? new Customfield() { Text = "" }).Text,
                    AgeRestriction = (x.Customfield.FirstOrDefault(y => y.Name == "Age") ?? new Customfield() { Text = "" }).Text,
                    Requirements = (x.Customfield.FirstOrDefault(y => y.Name == "Requirements") ?? new Customfield() { Text = "" }).Text
                }).ToList()
            };
        }
    }
}
