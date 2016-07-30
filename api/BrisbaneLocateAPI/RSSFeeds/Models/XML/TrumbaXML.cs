using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace RSSFeeds.Models.XML
{
    [XmlRoot(ElementName = "image")]
    public class Image
    {
        [XmlElement(ElementName = "title")]
        public string Title { get; set; }
        [XmlElement(ElementName = "url")]
        public string Url { get; set; }
        [XmlElement(ElementName = "link")]
        public string Link { get; set; }
    }

    [XmlRoot(ElementName = "guid")]
    public class Guid
    {
        [XmlAttribute(AttributeName = "isPermaLink")]
        public string IsPermaLink { get; set; }
        [XmlText]
        public string Text { get; set; }
    }

    [XmlRoot(ElementName = "masterid", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
    public class Masterid
    {
        [XmlAttribute(AttributeName = "isPermaLink")]
        public string IsPermaLink { get; set; }
        [XmlText]
        public string Text { get; set; }
    }

    [XmlRoot(ElementName = "localstart", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
    public class Localstart
    {
        [XmlAttribute(AttributeName = "tzAbbr")]
        public string TzAbbr { get; set; }
        [XmlAttribute(AttributeName = "tzCode")]
        public string TzCode { get; set; }
        [XmlText]
        public string Text { get; set; }
    }

    [XmlRoot(ElementName = "localend", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
    public class Localend
    {
        [XmlAttribute(AttributeName = "tzAbbr")]
        public string TzAbbr { get; set; }
        [XmlAttribute(AttributeName = "tzCode")]
        public string TzCode { get; set; }
        [XmlText]
        public string Text { get; set; }
    }

    [XmlRoot(ElementName = "customfield", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
    public class Customfield
    {
        [XmlAttribute(AttributeName = "name")]
        public string Name { get; set; }
        [XmlAttribute(AttributeName = "id")]
        public string Id { get; set; }
        [XmlAttribute(AttributeName = "type")]
        public string Type { get; set; }
        [XmlText]
        public string Text { get; set; }
        [XmlAttribute(AttributeName = "imageWidth")]
        public string ImageWidth { get; set; }
        [XmlAttribute(AttributeName = "imageHeight")]
        public string ImageHeight { get; set; }
    }

    [XmlRoot(ElementName = "item")]
    public class Item
    {
        [XmlElement(ElementName = "title")]
        public string Title { get; set; }
        [XmlElement(ElementName = "description")]
        public List<string> Description { get; set; }
        [XmlElement(ElementName = "link")]
        public string Link { get; set; }
        [XmlElement(ElementName = "ealink", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
        public string Ealink { get; set; }
        [XmlElement(ElementName = "category")]
        public string Category { get; set; }
        [XmlElement(ElementName = "guid")]
        public Guid Guid { get; set; }
        [XmlElement(ElementName = "masterid", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
        public Masterid Masterid { get; set; }
        [XmlElement(ElementName = "summary", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Summary { get; set; }
        [XmlElement(ElementName = "location", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Location { get; set; }
        [XmlElement(ElementName = "dtstart", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Dtstart { get; set; }
        [XmlElement(ElementName = "localstart", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
        public Localstart Localstart { get; set; }
        [XmlElement(ElementName = "formatteddatetime", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
        public string Formatteddatetime { get; set; }
        [XmlElement(ElementName = "dtend", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Dtend { get; set; }
        [XmlElement(ElementName = "localend", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
        public Localend Localend { get; set; }
        [XmlElement(ElementName = "cdo-alldayevent", Namespace = "http://schemas.microsoft.com/x-microsoft")]
        public string Cdoalldayevent { get; set; }
        [XmlElement(ElementName = "uid", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Uid { get; set; }
        [XmlElement(ElementName = "customfield", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
        public List<Customfield> Customfield { get; set; }
        [XmlElement(ElementName = "categorycalendar", Namespace = "http://schemas.trumba.com/rss/x-trumba")]
        public string Categorycalendar { get; set; }
    }

    [XmlRoot(ElementName = "channel")]
    public class Channel
    {
        [XmlElement(ElementName = "title")]
        public string Title { get; set; }
        [XmlElement(ElementName = "link")]
        public string Link { get; set; }
        [XmlElement(ElementName = "description")]
        public string Description { get; set; }
        [XmlElement(ElementName = "language")]
        public string Language { get; set; }
        [XmlElement(ElementName = "lastBuildDate")]
        public string LastBuildDate { get; set; }
        [XmlElement(ElementName = "image")]
        public Image Image { get; set; }
        [XmlElement(ElementName = "prodid", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Prodid { get; set; }
        [XmlElement(ElementName = "version", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Version { get; set; }
        [XmlElement(ElementName = "method", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Method { get; set; }
        [XmlElement(ElementName = "calscale", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Calscale { get; set; }
        [XmlElement(ElementName = "calname", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Calname { get; set; }
        [XmlElement(ElementName = "timezone", Namespace = "urn:ietf:params:xml:ns:xcal")]
        public string Timezone { get; set; }
        [XmlElement(ElementName = "item")]
        public List<Item> Item { get; set; }
    }

    [XmlRoot(ElementName = "rss")]
    public class TrumbaXML
    {
        [XmlElement(ElementName = "channel")]
        public Channel Channel { get; set; }
        [XmlAttribute(AttributeName = "x-wr", Namespace = "http://www.w3.org/2000/xmlns/")]
        public string Xwr { get; set; }
        [XmlAttribute(AttributeName = "xsi", Namespace = "http://www.w3.org/2000/xmlns/")]
        public string Xsi { get; set; }
        [XmlAttribute(AttributeName = "xsd", Namespace = "http://www.w3.org/2000/xmlns/")]
        public string Xsd { get; set; }
        [XmlAttribute(AttributeName = "x-trumba", Namespace = "http://www.w3.org/2000/xmlns/")]
        public string Xtrumba { get; set; }
        [XmlAttribute(AttributeName = "x-microsoft", Namespace = "http://www.w3.org/2000/xmlns/")]
        public string Xmicrosoft { get; set; }
        [XmlAttribute(AttributeName = "xCal", Namespace = "http://www.w3.org/2000/xmlns/")]
        public string XCal { get; set; }
        [XmlAttribute(AttributeName = "version")]
        public string Version { get; set; }
    }


}
