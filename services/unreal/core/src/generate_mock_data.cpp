#include "generate_mock_data.h"

#include <random>

#include "data/configuration.h"

#include "reflect/serialize.h"

namespace xrit_unreal
{
std::string generateMockConfiguration()
{
    std::stringstream out;
    Configuration configuration{
        .udp_unicast_endpoint{.url = "192.168.0.1", .port = 1000},
        .livelink{.sources{
            LiveLinkDummySource{.id = generateMockGuid(),
                                .settings{.ip_address = "10.10.10.10",
                                          .port = 123456,
                                          .base{.mode = LiveLinkSourceMode::Latest,
                                                .buffer_settings{.max_number_of_frames_to_buffer = 1234}}}},
            LiveLinkMvnSource{.id = generateMockGuid(),
                              .settings{.port = 9999, .base{.mode = LiveLinkSourceMode::Timecode}}},
            LiveLinkOptitrackSource{
                .id = generateMockGuid(),
                .settings{.server_address = "123.4.5.6",
                          .client_address = "192.168.10.10",
                          .is_multicast = false,
                          .base{.mode = LiveLinkSourceMode::Latest, .buffer_settings{.valid_engine_time = 23.f}}}},
            LiveLinkXrSource{.id = generateMockGuid(), .settings{.track_controllers = true, .track_hmds = true}},
            LiveLinkFreeDSource{.id = generateMockGuid(),
                                .settings{.ip_address = "192.168.0.1", .udp_port = 1234567}}}}};

    serialize(configuration, out);
    return prettifyJson(out.str());
}

std::string generateMockSetConfigurationResultSuccess()
{
    std::stringstream out;
    SetConfigurationResult result{};
    serialize(result, out);
    return prettifyJson(out.str());
}

std::string generateMockSetConfigurationResultParseError()
{
    std::stringstream out;
    SetConfigurationResult result{.parse_errors{ParseError{.code = ParseErrorCode::InvalidValue,
                                                           .containing_object = "object_name_here",
                                                           .value = "1234",
                                                           .message = "Guid does not contain valid value"}}};
    serialize(result, out);
    return prettifyJson(out.str());
}

std::string generateMockStatus()
{
    std::stringstream out;
    return out.str();
}

Guid generateMockGuid()
{
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<uint32_t> dist(0, std::numeric_limits<uint32_t>::max());

    Guid out{.a = dist(gen), .b = dist(gen), .c = dist(gen), .d = dist(gen)};
    return out;
}

void indent(uint32_t indentation, char character, uint32_t count, std::stringstream &out)
{
    for (size_t i = 0; i < indentation * count; i++)
    {
        out << character;
    }
}

std::string prettifyJson(std::string_view json, uint32_t indentationCount, char indentationCharacter)
{
    std::stringstream out;
    uint32_t indentation = 0;

    size_t index = 0;
    size_t length = json.size();
    while (index < length)
    {
        char const *current = json.data() + index;

        // skip whitespace
        if (current[0] == ' ' || current[0] == '\t' || current[0] == '\n')
        {
            ++index;
            continue;
        }

        // string
        if (current[0] == '"')
        {
            char const *end = current + 1;
            // find the next " that isn't preceded by an escape literal
            while (true)
            {
                end = strchr(end, '"');
                assert(end != nullptr && "unclosed string literal");

                if (*(end - 1) == '\\')
                {
                    ++end; // skip the "
                }
                else
                {
                    break;
                }
            }
            size_t stringLength = end - current + 1;
            std::string_view literal(current, stringLength);
            out << literal;
            index += stringLength;
            continue;
        }

        // open scope
        if (current[0] == '{' || current[0] == '[')
        {
            out << current[0] << '\n';
            ++indentation;
            indent(indentation, indentationCharacter, indentationCount, out);
            ++index;
            continue;
        }

        // close scope
        if (current[0] == '}' || current[0] == ']')
        {
            out << '\n';
            --indentation;
            indent(indentation, indentationCharacter, indentationCount, out);
            out << current[0];
            ++index;
            continue;
        }

        if (current[0] == ',')
        {
            out << current[0] << '\n';
            indent(indentation, indentationCharacter, indentationCount, out);
            ++index;
            continue;
        }

        if (current[0] == ':')
        {
            out << current[0] << ' ';
            ++index;
            continue;
        }

        out << current[0];
        ++index;
    }

    return out.str();
}
} // namespace xrit_unreal